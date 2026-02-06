import { OauthService } from './oauth.service';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import express from 'express';
import { UserService } from 'src/user/user.service';
import { IUserFromTokenResponse } from 'src/core/interfaces';
import {
  AuthorizeUrlResponseDto,
  GenerateAuthUrlDto,
} from './dtos/generate-auth-url.dto';
import {
  ExchangeTokenDto,
  ExchangeTokenResponseDto,
} from './dtos/exchange-token.dto';
import { OAUTH_ERROR_MESSAGES } from './constants';
import { renderRedirectionTemplate } from './templates/redirection_fallback_template';
import {
  generateCodeVerifier,
  generateCodeChallenge,
} from 'src/core/utils/pkce-utils';
import { GeneratePKCECodesDto } from './dtos/generate-pkce-codes.dto';
import * as types from 'src/user/types';
import { AuthTypeEnum } from 'src/core/enums/auth_enums';

@ApiTags('OAuth')
@Controller('oauth')
export class OauthController {
  private logger = new Logger(OauthController.name);

  constructor(
    private oauhtService: OauthService,
    private userService: UserService
  ) { }

  @Get('pkce-generator')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Générer des codes PKCE',
  })
  @ApiCreatedResponse({
    description:
      "Codes PKCE générés pour utiliser dans le processus d'authentification 0Auth",
    type: GeneratePKCECodesDto,
  })
  async generatePKCECodes(): Promise<types.PKCEGeneratorResponse> {
    const codeVerifier = generateCodeVerifier();

    return {
      codeVerifier: codeVerifier,
      codeChallenge: await generateCodeChallenge(codeVerifier),
    };
  }

  @Post('google/authorize-url')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Générer l'URL d'autorisation Google",
  })
  @ApiCreatedResponse({
    description: 'Lien de connexion généré avec succès',
    type: AuthorizeUrlResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Le codeChallenge est requis',
  })
  getGoogleAuthorizeUrl(
    @Body() generateAuthUrlDto: GenerateAuthUrlDto,
  ): types.AuthorizeUrlResponse {
    return {
      statusCode: HttpStatus.CREATED,
      authUrl: this.oauhtService.generateGoogleAuthUrl(
        generateAuthUrlDto.codeChallenge,
      ),
      message: 'Lien de connexion généré avec succès',
    };
  }

  @Post('google/exchange-token')
  @ApiOperation({
    summary:
      "Échanger le code d'autorisation contre un token et insérer l'utilisateur dans la base de données",
  })
  @ApiBody({ type: ExchangeTokenDto })
  @ApiOkResponse({
    description: 'Token échangé avec succés',
    type: ExchangeTokenResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      "Le code d'autorisation est invalide, expiré ou a déjà été utilisé",
  })
  @HttpCode(HttpStatus.OK)
  async exchangeToken(
    @Body() exchangeTokenDto: ExchangeTokenDto,
  ): Promise<types.ExchangeTokenResponse> {
    try {
      // exchange code to token
      const responsePayload = await firstValueFrom(
        this.oauhtService.exchangeCodeToToken(
          exchangeTokenDto.codeVerifier,
          exchangeTokenDto.authorizationCode,
        ),
      );

      const userInfoPayload = await firstValueFrom(
        this.oauhtService.getUserFromToken(responsePayload.access_token),
      );

      if (!userInfoPayload) throw new BadRequestException();

      const user = await this.userService.getUserByEmail(
        (userInfoPayload as IUserFromTokenResponse).email,
      );

      // create user if not exist and create account
      if (!user) {
        const newUser = await this.userService.createNewUser(
          {
            email: (userInfoPayload as IUserFromTokenResponse).email,
            fullName: (userInfoPayload as IUserFromTokenResponse).name,
            type: '0Auth',
            provider: 'GOOGLE',
            accessToken: responsePayload.access_token,
            tokenType: 'Bearer',
            expiresAt: responsePayload.expires_in,
            scope: responsePayload.scope,
            idToken: responsePayload.id_token,
            sessionState: '',
            providerAccountId: (userInfoPayload as IUserFromTokenResponse).sub,
          },
          AuthTypeEnum.OAUTH,
        );

        if (!newUser)
          throw new BadRequestException("Impossible de créer l'utilisateur");

        return {
          statusCode: HttpStatus.OK,
          ...await this.oauhtService.generateTokens(newUser.id, newUser.email)
        };
      }

      //  update account 
      await this.userService.updateAccount(user.id, {
        accessToken: responsePayload.access_token,
        tokenType: 'Bearer',
        expiresAt: responsePayload.expires_in,
        scope: responsePayload.scope,
        idToken: responsePayload.id_token,
        sessionState: '',
      });


      return {
        statusCode: HttpStatus.OK,
        ...await this.oauhtService.generateTokens(user.id, user.email)
      };


    } catch (err) {
      this.logger.error('An error was occurend when exchanging token: ', err);

      if (err instanceof UnauthorizedException) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Impossible d’échanger le code d’autorisation avec Google. Veuillez réessayer.',
      );
    }
  }

  @Get('google/callback')
  @HttpCode(HttpStatus.PERMANENT_REDIRECT)
  @ApiOperation({
    summary: 'Callback de redirection Google OAuth',
  })
  @ApiOkResponse({
    description:
      "Redirection vers l'application mobile avec le code d'autorisation",
  })
  @ApiBadRequestResponse({
    description: "Le code d'authorisation est requis",
  })
  googleAuthCallback(
    @Res() res: express.Response,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
  ) {
    if (!code || code.toString().length === 0) {
      throw new BadRequestException("Le code d'authorisation est requis");
    }

    const params = new URLSearchParams();

    if (code) {
      params.append('code', code);
    }

    if (state) {
      params.append('state', state);
    }

    if (error && error.trim().length > 0) {
      const errorMessage =
        OAUTH_ERROR_MESSAGES[error] ||
        "Une erreur s'est produite lors de l'authentification avec Google";

      params.append('error', errorMessage);
    }

    const deepLink = `safeo://auth-callback?${params.toString()}`;

    // close window and redirect to deep link
    return res.send(renderRedirectionTemplate(deepLink));
  }
}
