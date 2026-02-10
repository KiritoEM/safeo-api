import { ApiProperty } from '@nestjs/swagger';
import { DocumentDto } from './document.dto';

export class GetDocumentResponseDTO {
    @ApiProperty({ example: 200 })
    statusCode!: number;

    @ApiProperty({
        example: 'Document récupéré avec succès',
    })
    message!: string;

    @ApiProperty({ type: DocumentDto })
    document!: DocumentDto;
}