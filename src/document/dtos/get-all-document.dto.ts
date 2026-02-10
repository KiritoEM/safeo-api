import { IsEnum, IsOptional } from 'class-validator';
import { DocumentAccessLevelEnum } from 'src/core/enums/document-enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileSortingEnum, FileTypeEnum } from 'src/core/enums/file-enums';
import { DocumentDto } from './document.dto';

export class GetAllDocumentsResponseDTO {
  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({
    example: 'Documents récupérés avec succès',
  })
  message!: string;

  @ApiProperty({ type: [DocumentDto] })
  documents!: [DocumentDto];
}

export class GetAllDocumentsQueryDTO {
  @ApiPropertyOptional({
    enum: DocumentAccessLevelEnum,
    description: "Niveau d'accés du fichier",
  })
  @IsEnum(DocumentAccessLevelEnum)
  @IsOptional()
  accessLevel?: DocumentAccessLevelEnum;

  @ApiPropertyOptional({ enum: FileTypeEnum, description: 'Type du fichier' })
  @IsEnum(FileTypeEnum)
  @IsOptional()
  fileType?: FileTypeEnum;

  @ApiPropertyOptional({ enum: FileSortingEnum, description: 'Trier par' })
  @IsEnum(FileSortingEnum)
  @IsOptional()
  sort?: FileSortingEnum;
}
