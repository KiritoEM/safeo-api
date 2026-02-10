import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class AcceptInviteQueryDTO {
    @ApiPropertyOptional({ type: 'string', description: "Token d'invitation" })
    @IsString()
    token?: string
}
