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
  GOOGLE_AUTHORIZE_REQUEST_URL,
  GOOGLE_SCOPES,
  GOOGLE_TOKEN_REQUEST_URL,
  GOOGLE_USERINFO_REQUEST_URL,
} from './constants';
import {
  IExchangeCodeToTokenResponse,
  IUserFromTokenResponse,
} from 'src/core/interfaces';
import { generateRandomString } from 'src/core/utils/crypto-utils';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class OauthService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @Inject('DrizzleAsyncProvider') private readonly db: NodePgDatabase,
  ) {}

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

  exchangeCodeToToken(
    code_verifier: string,
    code: string,
  ): Observable<IExchangeCodeToTokenResponse> {
    if (!code_verifier || !code)
      throw new BadRequestException('Le code et code_verifier est requis');

    return this.httpService
      .post<IExchangeCodeToTokenResponse>(
        GOOGLE_TOKEN_REQUEST_URL,
        new URLSearchParams({
          client_id: this.configService.get<string>('oauth.google.clientId')!,
          client_secret: this.configService.get<string>(
            'oauth.google.clientSecret',
          )!,
          code_verifier,
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
}
