import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description: "Identifiant unique de l'utilisateur",
  })
  id!: string;

  @ApiProperty({
    type: 'string',
    description: "Adresse email de l'utilisateur",
  })
  email!: string;

  @ApiProperty({
    type: 'string',
    description: "Nom complet de l'utilisateur",
  })
  fullName!: string;

  @ApiProperty({
    type: 'number',
    required: false,
    description: 'Limite de stockage en octets (défaut : 0.5 GB)',
    default: 0.5 * 1024 * 1024 * 1024,
  })
  storageLimits?: number;

  @ApiProperty({
    type: 'number',
    required: false,
    description: 'Espace de stockage utilisé en octets (défaut : 0)',
    default: 0,
  })
  storageUsed?: number;

  @ApiProperty({
    type: 'boolean',
    required: false,
    description: "Indique si l'utilisateur est actif (défaut : true)",
    default: true,
  })
  isActive?: boolean;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Date de dernière connexion',
  })
  lastLoginAt!: Date;

  @ApiProperty({
    type: 'boolean',
    required: false,
    description: "Indique si l'utilisateur est supprimé (défaut : false)",
    default: false,
  })
  isDeleted?: boolean;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    description: 'Date de suppression (optionnel)',
  })
  deletedAt?: Date;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Date de création',
  })
  createdAt!: Date;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Date de dernière mise à jour',
  })
  updatedAt!: Date;
}
