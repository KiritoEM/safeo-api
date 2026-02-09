import { OauthService } from './oauth.service';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Query,
  Res
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import express from 'express';
import {
  generateCodeVerifier,
  generateCodeChallenge,
} from 'src/core/utils/pkce-utils';
import { GeneratePKCECodesDto } from './dtos/generate-pkce-codes.dto';
import * as types from 'src/user/types';
import { renderRedirectionTemplate } from './templates/redirection_fallback_template';
import { OAUTH_ERROR_MESSAGES } from './constants';
import {
  AuthorizeUrlResponseDto,
  GenerateAuthUrlDto,
} from './dtos/generate-auth-url.dto';
import {
  ExchangeTokenDto,
  ExchangeTokenResponseDto,
} from './dtos/exchange-token.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('OAuth')
@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5/min
@Controller('oauth')
export class OauthController {
  constructor(
    private oauthService: OauthService,
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
      authUrl: this.oauthService.generateGoogleAuthUrl(
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
    @Ip() ip
  ): Promise<types.ExchangeTokenResponse> {
    const tokensPayload = await this.oauthService.exchangeCodeToToken(
      exchangeTokenDto.codeVerifier,
      exchangeTokenDto.authorizationCode,
      ip
    );

    return {
      statusCode: HttpStatus.OK,
      ...tokensPayload
    };
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
