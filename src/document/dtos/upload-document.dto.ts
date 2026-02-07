import { IsEnum, IsNotEmpty } from 'class-validator';
import { DocumentAccessLevelEnum } from 'src/core/enums/document-enums';
import { ApiProperty } from "@nestjs/swagger";

export class UploadDocumentDTO {
    @ApiProperty({ name: 'accessLevel', enum: DocumentAccessLevelEnum })
    @IsEnum(DocumentAccessLevelEnum)
    @IsNotEmpty()
    accessLevel?: DocumentAccessLevelEnum

    @ApiProperty({ type: 'string', format: 'binary', required: true })
    file?: any
}