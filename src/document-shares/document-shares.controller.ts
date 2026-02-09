import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { DocumentSharesService } from './document-shares.service';
import { ShareLinkDto, ShareLinkResponseDto } from './dtos/share-link-dto';
import { UserReq } from 'src/core/decorators/user.decorator';
import { ApiBearerAuth, ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/jwt.guard';
import * as types from 'src/auth/types';
import { BaseApiReturn } from 'src/core/interfaces';

@Controller('document-shares')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
export class DocumentSharesController {
    constructor(private documentSharesService: DocumentSharesService) { }

    @Post('share/:documentId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary:
            "Partager un lien d'invitation par email",
    }) @ApiBody({ type: ShareLinkDto })
    @ApiOkResponse({
        description: "Lien d'invitation envoyée avec succés",
        type: ShareLinkResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Utilisateur introuvable',
    })
    async shareFile(
        @UserReq() userReq: types.UserPayload,
        @Param('documentId') documentId: string,
        @Body() body: ShareLinkDto
    ): Promise<BaseApiReturn> {
        await this.documentSharesService.shareEmailLink(userReq.id, documentId, body.invitedEmail);

        return {
            statusCode: HttpStatus.OK,
            message: "Lien d'invitation envoyée avec succés"
        }
    }
}
