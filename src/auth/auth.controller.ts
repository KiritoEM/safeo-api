import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { LoginDTO, LoginResponseDTO } from './dtos/login.dto';
import {
  IloginResponse,
  IrefreshTokenResponse,
  ISignupSendOtpResponse,
  Iverify2FAResponse,
} from './types';
import { Verify2FADto, Verify2FAResponseDto } from './dtos/verify-otp.dto';
import {
  ResendOtpDTO,
  SignupSendOtpDTO,
  SignupSendOtpResponseDTO,
} from './dtos/signup-sendotp.dto';
import { refreshAccessTokenDto, refreshAccessTokenResponseDto } from './dtos/refresh-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Connecter l'utilisateur et envoyer l'OTP de connexion par email",
  })
  @ApiBody({ type: LoginDTO })
  @ApiOkResponse({
    description: 'Utilisateur connecté avec succés',
    type: LoginResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Aucun utilisateur trouvé avec cet email',
  })
  @ApiUnauthorizedResponse({
    description: 'Mot de passe incorrect',
  })
  async login(@Body() loginDto: LoginDTO): Promise<IloginResponse> {
    //login user
    const user = await this.authService.login(loginDto);

    //send 2FA code if user has logged successfully
    await this.authService.sendLoginOTP(user.email, user.id);

    return {
      statusCode: HttpStatus.OK,
      verificationToken: user.verificationToken,
      message: 'Code OTP envoyé avec succés par email',
    };
  }

  @Post('login/resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Renvoyer le code OTP de connexion",
  })
  @ApiBody({ type: ResendOtpDTO })
  @ApiOkResponse({
    description: 'Code OTP réenvoyé avec succés',
    type: LoginResponseDTO,
  })
  async resendLoginOTP(
    @Body() loginOtpDto: ResendOtpDTO,
  ): Promise<IloginResponse> {
    // send 2FA code
    const { verificationToken } = await this.authService.resendLoginOTP(
      loginOtpDto.verificationToken,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Code OTP réenvoyé avec succés',
      verificationToken,
    };
  }


  @Post('login/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verifier le code OTP de connexion',
  })
  @ApiBody({ type: Verify2FADto })
  @ApiOkResponse({
    description: 'Utilisateur connecté avec succés',
    type: Verify2FAResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Session expirée ou, code de connexion incorrect ou expiré.',
  })
  async verifyLoginOTP(
    @Body() verify2faDto: Verify2FADto,
  ): Promise<Iverify2FAResponse> {
    const otpVerificationResponse = await this.authService.verifyLoginOTP(
      verify2faDto.code,
      verify2faDto.verificationToken,
    );

    // create JWT Token
    const JWTPayload = {
      id: otpVerificationResponse.id,
      email: otpVerificationResponse.email,
    };

    return {
      statusCode: HttpStatus.OK,
      accessToken: this.jwtService.sign(JWTPayload),
      refreshToken: otpVerificationResponse.refreshToken,
      message: 'Connexion réussie',
    };
  }

  @Post('signup/send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "Inscrire l'utilisateur en envoyant un code OTP d'inscription par email",
  })
  @ApiBody({ type: SignupSendOtpDTO })
  @ApiOkResponse({
    description: "Code OTP envoyé avec succés pour l'inscription",
    type: SignupSendOtpResponseDTO,
  })
  @ApiConflictResponse({
    description: "Un compte avec l'adresse email existe déja.",
  })
  async sendSignupOTPEmail(
    @Body() signupSendOtpDto: SignupSendOtpDTO,
  ): Promise<ISignupSendOtpResponse> {
    //check if user already exists with this email
    const isUserExists = await this.authService.checkIfUserExists(
      signupSendOtpDto.email,
    );

    if (isUserExists) {
      throw new ConflictException(
        'Ce compte existe déja, réessayez avec un autre adresse email.',
      );
    }

    // send 2FA code
    const { verificationToken } =
      await this.authService.sendSignupOTP(signupSendOtpDto);

    return {
      statusCode: HttpStatus.OK,
      message: "Code OTP envoyé avec succés pour l'inscription",
      verificationToken,
    };
  }

  @Post('signup/resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Renvoyer le code OTP d'inscription",
  })
  @ApiBody({ type: ResendOtpDTO })
  @ApiOkResponse({
    description: 'Code OTP réenvoyé avec succés',
    type: SignupSendOtpResponseDTO,
  })
  async resendSignupOTP(
    @Body() signupResendOtpDto: ResendOtpDTO,
  ): Promise<ISignupSendOtpResponse> {
    const { verificationToken } = await this.authService.resendSignupOTP(
      signupResendOtpDto.verificationToken,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Code OTP réenvoyé avec succés',
      verificationToken,
    };
  }

  @Post('signup/verify-otp')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      "Verifier le code OTP d'inscription et inscrire l'utilisateur dans le BD",
  })
  @ApiBody({ type: Verify2FADto })
  @ApiOkResponse({
    description: 'Utilisateur inscrit avec succés',
    type: Verify2FAResponseDto,
  })
  async verifySignupOTP(
    @Body() verify2faDto: Verify2FADto,
  ): Promise<Iverify2FAResponse> {
    // verify 2FA
    const otpVerificationResponse = await this.authService.verifySignupOTP(
      verify2faDto.code,
      verify2faDto.verificationToken,
    );

    // create user
    const createdUser = await this.authService.createNewUser(
      otpVerificationResponse,
    );

    // create JWT Token
    const JWTPayload = {
      id: createdUser.id,
      email: createdUser.email,
    };

    return {
      statusCode: HttpStatus.CREATED,
      accessToken: this.jwtService.sign(JWTPayload),
      refreshToken: createdUser.refreshToken as string,
      message: 'Inscription réussie! Bienvenue sur Safeo.',
    };
  }

  @Post('refresh-access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Rafraichir le token d'accés",
  })
  @ApiBody({ type: refreshAccessTokenDto })
  @ApiOkResponse({
    description: "Token d'accés rafraichis avec succés",
    type: refreshAccessTokenResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token invalide ou refresh token expiré',
  })
  async refreshAccessToken(
    @Body() refreshTokenDto: refreshAccessTokenDto,
  ): Promise<IrefreshTokenResponse> {
    const { accessToken } = await this.authService.refreshAccesToken(refreshTokenDto.refreshToken);

    return {
      statusCode: HttpStatus.CREATED,
      accessToken,
      message: "Token d'accés rafraichis avec succés",
    };
  }
}
