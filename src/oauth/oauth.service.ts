import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  BadRequestException,
  Inject,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AxiosError, AxiosResponse } from 'axios';
import {
  IRequestGoogleTokenResponse,
  IUserFromTokenResponse,
} from 'src/core/interfaces';
import { formatEncryptedData, generateRandomString } from 'src/core/utils/crypto-utils';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JWT_REFRESH_TOKEN_DURATION } from 'src/core/constants/jwt-constants';
import { UserRepository } from 'src/user/user.repository';
import { User } from 'src/drizzle/schemas';
import {
  GOOGLE_AUTHORIZE_REQUEST_URL,
  GOOGLE_SCOPES,
  GOOGLE_TOKEN_REQUEST_URL,
  GOOGLE_USERINFO_REQUEST_URL,
} from './constants';
import { ActivityLogRepository } from 'src/activity-logs/activity-logs.repository';
import { AUDIT_ACTIONS, AUDIT_TARGET } from 'src/activity-logs/constants';
import { UserService } from 'src/user/user.service';
import { AuthTypeEnum } from 'src/core/enums/auth-enums';
import { EncryptionKeyService } from 'src/encryption/encryption-key.service';

@Injectable()
export class OauthService {
  constructor(
    private userRepository: UserRepository,
    private configService: ConfigService,
    private httpService: HttpService,
    private jwtService: JwtService,
    private logRepository: ActivityLogRepository,
    private userService: UserService,
    private encryptionKeyService: EncryptionKeyService,
    @Inject('DrizzleAsyncProvider') private readonly db: NodePgDatabase,
  ) { }

  // generate google Auth URL to open in browser
  generateGoogleAuthUrl(codeChallenge: string): string {
    if (!codeChallenge)
      throw new BadRequestException('Le codeChallenge est requis');

    const params = new URLSearchParams({
      client_id: this.configService.get<string>('oauth.google.clientId')!,
      redirect_uri: this.configService.get<string>('oauth.google.redirectUri')!,
      response_type: 'code',
      scope: GOOGLE_SCOPES.join(' '),
      state: generateRandomString(),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `${GOOGLE_AUTHORIZE_REQUEST_URL}?${params.toString()}`;
  }

  // Request token and obtain access token
  async requestGoogleToken(
    codeVerifier: string,
    code: string,
  ): Promise<IRequestGoogleTokenResponse> {
    if (!codeVerifier || !code)
      throw new BadRequestException('Le code et code_verifier est requis');

    return firstValueFrom(
      this.httpService
        .post<IRequestGoogleTokenResponse>(
          GOOGLE_TOKEN_REQUEST_URL,
          new URLSearchParams({
            client_id: this.configService.get<string>('oauth.google.clientId')!,
            client_secret: this.configService.get<string>(
              'oauth.google.clientSecret',
            )!,
            code_verifier: codeVerifier,
            code,
            grant_type: 'authorization_code',
            redirect_uri: this.configService.get<string>(
              'oauth.google.redirectUri',
            )!,
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
        .pipe(
          map(
            (response: AxiosResponse<IRequestGoogleTokenResponse>) =>
              response.data,
          ),
        ),
    );
  }

  // exchange authorization code to access token 
  async exchangeCodeToToken(
    codeVerifier: string,
    code: string,
    ipAddress?: string,
  ) {
    if (!codeVerifier || !code)
      throw new BadRequestException('Le code et code_verifier est requis');

    // Request google token
    const responsePayload = await this.requestGoogleToken(codeVerifier, code);

    // get user info from using access_token
    const userInfoPayload = await firstValueFrom(
      this.getUserFromToken(responsePayload.access_token),
    );

    if (!userInfoPayload) throw new BadRequestException();

    const user = await this.userService.getUserByEmail(
      (userInfoPayload as IUserFromTokenResponse).email,
    );

    // create user if not exist and create account
    if (!user) {
      // generate KEK encryption key
          const encryptionPayload = this.encryptionKeyService.generateAESKek();
      
          if (!encryptionPayload) {
            throw new InternalServerErrorException('Impossible de créer la clé de chiffrement');
          }

      const newUser = await this.userService.createNewUser(
        {
          email: (userInfoPayload as IUserFromTokenResponse).email,
          fullName: (userInfoPayload as IUserFromTokenResponse).name,
          type: '0Auth',
          provider: 'GOOGLE',
          accessToken: responsePayload.access_token,
          encryptedKey: formatEncryptedData(encryptionPayload.IV, encryptionPayload.encrypted as string, encryptionPayload.tag),
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

      // return generated auth tokens
      return {
        ...(
          await this.generateTokens(
            newUser.id,
            newUser.email,
            ipAddress,
          )
        )
      };
    }

    // update account
    await this.userService.updateAccount(user.id, {
      accessToken: responsePayload.access_token,
      tokenType: 'Bearer',
      expiresAt: responsePayload.expires_in,
      scope: responsePayload.scope,
      idToken: responsePayload.id_token,
      sessionState: '',
    });

    // return generated auth tokens
    return {
      ...(await this.generateTokens(user.id, user.email)),
    };
  }

  // get user informations from access token
  getUserFromToken(token: string): Observable<IUserFromTokenResponse | Error> {
    return this.httpService
      .get<IUserFromTokenResponse>(GOOGLE_USERINFO_REQUEST_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        map((response: AxiosResponse<IUserFromTokenResponse>) => response.data),
        catchError((err: AxiosError): Observable<Error> => {
          if (err.response?.status === 401) {
            return throwError(
              () =>
                new UnauthorizedException('Token Google invalide ou expiré'),
            );
          }

          return throwError(() => err);
        }),
      );
  }

  // create refresh token and update user
  async createRefreshToken(userId: string): Promise<User | null> {
    const refreshToken = this.jwtService.sign(
      {},
      {
        expiresIn: JWT_REFRESH_TOKEN_DURATION,
      },
    );

    const user = await this.userRepository.update(userId, { refreshToken });

    return user[0];
  }

  // generate 0auth tokens
  async generateTokens(userId: string, email: string, ipAddress?: string) {
    // audit log
    await this.logRepository.log({
      action: AUDIT_ACTIONS.OAUTH_ACTION,
      target: AUDIT_TARGET.ACCOUNT,
      userId,
      ipAddress,
    });

    // create refresh token
    const updatedUser = await this.createRefreshToken(userId);

    const JWTpayload = { sub: userId, email };

    return {
      accessToken: await this.jwtService.signAsync(JWTpayload),
      refreshToken: updatedUser?.refreshToken as string,
      message: 'Utilisateur connecté avec succés avec Google',
    };
  }
}