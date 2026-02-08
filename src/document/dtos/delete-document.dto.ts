import { ApiProperty } from "@nestjs/swagger";

export class DeleteDocumentResponseDTO {
    @ApiProperty({ example: 204 })
    statusCode!: number;

    @ApiProperty({
        example: 'Document supprimé avec succès',
    })
    message!: string;
}