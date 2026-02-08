import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { DocumentDto } from "./document.dto";

export class UpdateDocumentDTO {
    @ApiProperty({ example: 'cv-kiritoem.pdf' })
    @IsString()
    @IsNotEmpty()
    fileName?: string
}

export class UpdateDocumentResponseDTO {
    @ApiProperty({ example: 200 })
    statusCode!: number;

    @ApiProperty({
        example: 'Document mis à jour avec succès',
    })
    message!: string;

    @ApiProperty({ type: DocumentDto })
    documents!: DocumentDto;
}