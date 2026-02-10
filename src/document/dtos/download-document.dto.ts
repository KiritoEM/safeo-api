// src/document/dtos/download-document.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class DownloadDocumentResponseDTO {
  @ApiProperty({
    example: 200,
    description: 'Code de statut HTTP'
  })
  statusCode!: number;

  @ApiProperty({
    example: 'Document prêt pour le téléchargement',
    description: 'Message de succès'
  })
  message!: string;

  @ApiProperty({
    example: 'https://storage.example.com/signed-url/document.pdf?token=xyz...',
    description: 'URL signée pour télécharger le document'
  })
  downloadUrl!: string;

  @ApiProperty({
    example: 'rapport-mensuel.pdf',
    description: 'Nom original du fichier'
  })
  fileName!: string;
}