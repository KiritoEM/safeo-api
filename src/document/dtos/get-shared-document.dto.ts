import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileSortingEnum, FileTypeEnum } from 'src/core/enums/file-enums';
import { SharedDocumentDto } from './shared-document.dto';

export class GetSharedDocumentsResponseDTO {
  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({
    example: 'Documents récupérés avec succès',
  })
  message!: string;

  @ApiProperty({ type: [SharedDocumentDto] })
  sharedDocuments!: [SharedDocumentDto];
}

export class GetSharedDocumentsQueryDTO {
  @ApiPropertyOptional({ enum: FileTypeEnum, description: 'Type du fichier' })
  @IsEnum(FileTypeEnum)
  @IsOptional()
  fileType?: FileTypeEnum;

  @ApiPropertyOptional({ enum: FileSortingEnum, description: 'Trier par' })
  @IsEnum(FileSortingEnum)
  @IsOptional()
  sort?: FileSortingEnum;
}
