import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO {
  @ApiProperty({ example: 'johndoer@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'votre_mot_de_passe' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}

export class LoginResponseDTO {
  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({
    example: 'Connexion reussie pour le premier facteur',
  })
  message!: string;

  @ApiProperty({ example: 'd13dba4621db80ac0ae...' })
  verificationToken!: string;
}
