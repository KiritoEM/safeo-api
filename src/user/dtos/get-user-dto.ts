import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class GetUserInfoResponseDTO {
    @ApiProperty({
        example: 200,
        description: 'Code de statut HTTP',
    })
    statusCode!: number;

    @ApiProperty({
        example: 'Informations utilisateur récupérées avec succès',
    })
    message!: string;

    @ApiProperty({
        type: UserDto,
        description: 'Informations publiques de l\'utilisateur',
    })
    user!: UserDto;
}