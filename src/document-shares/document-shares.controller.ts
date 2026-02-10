import { Body, Controller, Get, HttpCode, HttpStatus, Logger, NotFoundException, Param, Post, Query, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { DocumentSharesService } from './document-shares.service';
import { ShareLinkDto, ShareLinkResponseDto } from './dtos/share-link-dto';
import { UserReq } from 'src/core/decorators/user.decorator';
import { ApiBearerAuth, ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/jwt.guard';
import * as types from 'src/auth/types';
import { BaseApiReturn } from 'src/core/interfaces';
import { AcceptInviteQueryDTO } from './dtos/accept-invite-dto';
import express from 'express';
import { renderInvitationTemplate } from './templates/invitation_redirection_success';
import { INVITE_BASE_URL } from './constants';
import { renderInvitationUnauthorizedTemplate } from './templates/inviration_redirection_unauthorized';
import { renderInvitationServerErrorTemplate } from './templates/invitation_redirection_error';

@Controller('document-shares')
@ApiBearerAuth('JWT-auth')
export class DocumentSharesController {
    private readonly logger = new Logger(DocumentSharesController.name);

    constructor(private documentSharesService: DocumentSharesService) { }

    @Post('share/:documentId')
    @UseGuards(AuthGuard)
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

    @Get('invite')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: "Accepter une invitation de partage via un token et rediriger vers l'application",
    })
    @ApiOkResponse({
        description: "Invitation acceptée avec succès",
    })
    @ApiNotFoundResponse({
        description: 'Utilisateur invité introuvable',
    })
    @ApiUnauthorizedResponse({
        description: 'Invitation introuvable ou expirée ou non valide',
    })
    acceptInvite(
        @Query() query: AcceptInviteQueryDTO,
        @Res() res: express.Response
    ) {
        try {
            if (!query.token) {
                this.logger.warn("Aucun jeton d'invitation");
                return res.send(renderInvitationUnauthorizedTemplate());
            }

            const appLink = `${INVITE_BASE_URL}?token=${query.token}`;

            return res.send(renderInvitationTemplate(appLink));
        }
        catch (err) {
            if (err instanceof UnauthorizedException || err instanceof NotFoundException) {
                this.logger.error(err.message);

                return res.send(renderInvitationUnauthorizedTemplate());
            }

            this.logger.error("Une erreur s'est produite lors de l'acception de l'invitation: ", err);
            return res.send(renderInvitationServerErrorTemplate());
        }
    }

    @Post('invite/accept')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: "Accepter l'invitation depuis l'application (authentifié)",
    })
    @ApiOkResponse({
        description: "Invitation acceptée avec succès",
    })
    @ApiNotFoundResponse({
        description: 'Utilisateur invité introuvable',
    })
    @ApiUnauthorizedResponse({
        description: 'Invitation introuvable ou expirée ou non valide',
    })
    async acceptInviteInApp(
        @UserReq() userReq: types.UserPayload,
        @Body('token') token: string,
    ): Promise<BaseApiReturn> {
        if (!token) {
            throw new UnauthorizedException("Aucun jeton d'invitation");
        }

        await this.documentSharesService.acceptInvite(userReq.id, token);

        return {
            statusCode: HttpStatus.OK,
            message: "Invitation acceptée avec succès"
        }
    }
}
