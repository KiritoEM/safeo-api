import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ExchangeTokenDto {
  @ApiProperty({ example: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk' })
  @IsString()
  @IsNotEmpty()
  codeVerifier!: string;

  @ApiProperty({ example: '4/0AdLIrYe...' })
  @IsString()
  @IsNotEmpty()
  authorizationCode!: string;
}

export class ExchangeTokenResponseDto {
  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({
    example: 'ya29.a0AfH6SMBx...',
    description: 'Access token for API requests',
  })
  access_token!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjI...',
    description: 'JWT ID token containing user information',
  })
  id_token!: string;

  @ApiProperty({
    example: '1//0gNXqhV8K...',
    description: 'Refresh token to obtain new access tokens',
  })
  refresh_token!: string;

  @ApiProperty({
    example: 3920,
    description: 'Refresh token expiration time in seconds',
  })
  refresh_token_expires_in!: number;

  @ApiProperty({
    example: [
      'openid',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    description: 'Scopes granted for this token',
    isArray: true,
    type: String,
  })
  scope!: string[];

  @ApiProperty({
    example: 'Bearer',
    description: 'Type of token',
  })
  token_type!: string;

  @ApiProperty({
    example: 'Tokens échangés avec succès',
  })
  message!: string;
}
