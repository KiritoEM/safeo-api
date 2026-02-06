import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GeneratePKCECodesDto {
  @ApiProperty({ example: '' })
  @IsString()
  codeVerifier!: string;

  @ApiProperty({ example: '' })
  @IsString()
  codeChallenge!: string;
}
