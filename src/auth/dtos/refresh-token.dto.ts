import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class refreshAccessTokenDto {
  @ApiProperty({ example: 'd13dba4621db80ac0ae...' })
  @IsNotEmpty()
  @IsString()
  refreshToken!: string;
}

export class refreshAccessTokenResponseDto {
  @IsString()
  refreshToken!: string;

  @ApiProperty({
    example: "Token d'accés rafraichis avec succés",
  })
  message!: string;
}
