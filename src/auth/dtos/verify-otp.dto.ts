import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class Verify2FADto {
  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @IsString()
  code!: string;

  @ApiProperty({ example: 'd13dba4621db80ac0ae...' })
  @IsNotEmpty()
  @IsString()
  verificationToken!: string;
}

export class Verify2FAResponseDto {
  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({
    example: 'Connexion reussie',
  })
  message!: string;

  @ApiProperty({ example: 'd13dba4621db80ac0ae...' })
  accessToken!: string;


  @ApiProperty({ example: 'd13dba4621db80ac0ae...' })
  refreshToken!: string;
}
