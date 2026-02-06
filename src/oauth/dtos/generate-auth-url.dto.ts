import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateAuthUrlDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  codeChallenge!: string;
}

export class AuthorizeUrlResponseDto {
  @ApiProperty({ example: 201 })
  statusCode!: number;

  @ApiProperty({
    example: 'https://accounts.google.com/o/oauth2/v2/auth?...',
  })
  auth_url!: string;

  @ApiProperty({
    example: 'Lien de connexion généré avec succès',
  })
  message!: string;
}
