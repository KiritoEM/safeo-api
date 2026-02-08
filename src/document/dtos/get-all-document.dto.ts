import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DocumentAccessLevelEnum } from 'src/core/enums/document-enums';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { FileSortingEnum, FileTypeEnum } from 'src/core/enums/file-enums';

export class GetAllDocumentDTO {
    @ApiProperty({ name: 'accessLevel', enum: DocumentAccessLevelEnum, description: "Niveau d'accés du fichier" })
    @IsEnum(DocumentAccessLevelEnum)
    @IsNotEmpty()
    accessLevel?: DocumentAccessLevelEnum

    @ApiProperty({ type: 'string', format: 'binary', required: true, description: 'Fichier a télécharger' })
    file?: any
}

export class GetAllDocumentResponseDTO {
    @IsString()
    refreshToken!: string;

    @ApiProperty({
        example: "Token d'accés rafraichis avec succés",
    })
    message!: string;
}

export class GetAllDocumentQueryDTO {
    @ApiPropertyOptional({ enum: DocumentAccessLevelEnum, description: "Niveau d'accés du fichier" })
    @IsEnum(DocumentAccessLevelEnum)
    @IsOptional()
    accessLevel?: DocumentAccessLevelEnum

    @ApiPropertyOptional({ enum: FileTypeEnum, description: 'Type du fichier' })
    @IsEnum(FileTypeEnum)
    @IsOptional()
    fileType?: FileTypeEnum

    @ApiPropertyOptional({ enum: FileSortingEnum, description: 'Trier par' })
    @IsEnum(FileSortingEnum)
    @IsOptional()
    sort?: FileSortingEnum
}
