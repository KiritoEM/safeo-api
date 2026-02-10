import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptInviteQueryDTO {
  @ApiPropertyOptional({ type: 'string', description: "Token d'invitation" })
  @IsString()
  token?: string;
}

export class AcceptInviteDTO {
  @ApiProperty({ example: 'd13dba4621db80ac0ae...' })
  @IsNotEmpty()
  @IsString()
  token?: string;
}

export class AcceptInviteResponseDTO {
  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({
    example: 'Connexion reussie pour le premier facteur',
  })
  message!: string;
}
