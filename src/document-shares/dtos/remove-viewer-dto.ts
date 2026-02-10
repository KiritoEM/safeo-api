import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveViewerDTO {
  @ApiProperty({
    example: 'd13dba4621db80ac0ae...',
    description: "ID de l'utilisateur à supprimer du partage",
  })
  @IsNotEmpty()
  @IsString()
  userIdToRemove?: string;
}