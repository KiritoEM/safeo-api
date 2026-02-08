import { IsEnum, IsNotEmpty } from 'class-validator';
import { DocumentAccessLevelEnum } from 'src/core/enums/document-enums';
import { ApiProperty } from "@nestjs/swagger";
import { DocumentDto } from './document.dto';

export class UploadDocumentDTO {
    @ApiProperty({ name: 'accessLevel', enum: DocumentAccessLevelEnum })
    @IsEnum(DocumentAccessLevelEnum)
    @IsNotEmpty()
    accessLevel?: DocumentAccessLevelEnum

    @ApiProperty({ type: 'string', format: 'binary', required: true })
    file?: any
}

export class UploadDocumentPublicDTO {
    @ApiProperty({ example: 201 })
    statusCode!: number;

    @ApiProperty({
        example: 'Document uploadé avec succès',
    })
    message!: string;

    @ApiProperty({ type: DocumentDto })
    data!: DocumentDto;
}
