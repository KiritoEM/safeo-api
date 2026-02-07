import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  BadRequestException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AxiosError, AxiosResponse } from 'axios';
import {
  IExchangeCodeToTokenResponse,
  IUserFromTokenResponse,
} from 'src/core/interfaces';
import { generateRandomString } from 'src/core/utils/crypto-utils';
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

@Injectable()
export class OauthService {
  constructor(
    private userRepository: UserRepository,
    private configService: ConfigService,
    private httpService: HttpService,
    private jwtService: JwtService,
    private logRepository: ActivityLogRepository,
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

  // exchange authorization code to access token
  exchangeCodeToToken(
    codeVerifier: string,
    code: string,
  ): Observable<IExchangeCodeToTokenResponse> {
    if (!codeVerifier || !code)
      throw new BadRequestException('Le code et code_verifier est requis');

    return this.httpService
      .post<IExchangeCodeToTokenResponse>(
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
          (response: AxiosResponse<IExchangeCodeToTokenResponse>) =>
            response.data,
        ),
      );
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
  async createRefreshToken(): Promise<User | null> {
    const refreshToken = this.jwtService.sign(
      {},
      {
        expiresIn: JWT_REFRESH_TOKEN_DURATION,
      },
    );

    const user = await this.userRepository.updateUser({ refreshToken });

    return user[0];
  }

  // generate 0auth tokens
  async generateTokens(userId: string, email: string, ipAddress?: string) {
    // audit log
    await this.logRepository.log({
      action: AUDIT_ACTIONS.OAUTH_ACTION,
      target: AUDIT_TARGET.ACCOUNT,
      userId,
      ipAddress
    });

    // create refresh token
    const updatedUser = await this.createRefreshToken();

    const JWTpayload = { sub: userId, email };

    return {
      accessToken: await this.jwtService.signAsync(JWTpayload),
      refreshToken: updatedUser?.refreshToken as string,
      message: 'Utilisateur connecté avec succés avec Google',
    };
  }
}
