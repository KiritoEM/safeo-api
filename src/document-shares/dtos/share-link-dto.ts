import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ShareLinkDto {
  @ApiProperty({ example: 'johndoer@example.comn' })
  @IsNotEmpty()
  @IsEmail()
  invitedEmail!: string;
}

export class ShareLinkResponseDto {
  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({ example: '16' })
  message!: string;
}
