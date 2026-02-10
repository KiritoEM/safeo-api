import { UserRepository } from 'src/user/user.repository';
import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtUtilsService } from 'src/jwt/jwt-utils.service';
import { MailService } from 'src/mail/mail.service';
import { INVITE_BASE_URL } from './constants';
import { DocumentSharesRepository } from './document-shares.repository';
import { CreateDocumentShareSchema, TokenInvitePayload } from './types';

@Injectable()
export class DocumentSharesService {
    private readonly logger = new Logger(DocumentSharesService.name);

    constructor(
        private jwtService: JwtUtilsService,
        private mailService: MailService,
        private UserRepository: UserRepository,
        private documentSharesRepository: DocumentSharesRepository
    ) { }

    //share email link
    async shareEmailLink(userId: string, documentId: string, invitedEmail: string) {
        // get user data
        const user = await this.UserRepository.findUserById(userId);

        if (!user) {
            throw new NotFoundException('Utilisateur introuvable');
        }

        // generate token link
        const linkJWTPayload = {
            documentId,
            invitedEmail
        } as TokenInvitePayload;

        const tokenInvite = await this.jwtService.createJWT(linkJWTPayload, {
            expiresIn: '5d'
        });

        const appLink = `${INVITE_BASE_URL}?token=${tokenInvite}`;

        this.logger.log(appLink);

        // send link to invited email
        try {
            await this.mailService.sendEmail({
                subject: `${user.fullName} vous a invité à voir un document`,
                to: invitedEmail,
                template: 'send-invitation',
                context: {
                    inviterName: user.fullName,
                    inviteLink: appLink
                }
                ,
            });
        } catch (err) {
            this.logger.error('Failed to send OTP to user: ', err);
            throw new InternalServerErrorException(
                "Impossible d'envoyer le lien d'invitation",
            );
        }
    }

    // accept invite by token
    async acceptInvite(ownerId: string, ownerEmail: string, tokenInvite: string) {
        // check token validity and expiration
        const tokenInvitePayload = await this.jwtService.verifyToken(tokenInvite) as TokenInvitePayload;

        if (!tokenInvitePayload) {
            throw new UnauthorizedException("Impossible de récuperer les informations dans le jeton d'invitation");
        }

        // check if invited email is same as owner email
        if (ownerEmail.trim() === tokenInvitePayload.invitedEmail.trim()) {
            throw new ConflictException("Le proprietaire ne pas partager le fichier avec son propre email");
        }

        // get invited user data
        const invitedUser = await this.UserRepository.findUserByEmail(tokenInvitePayload.invitedEmail);

        // check if invited email is same as owner email

        if (!invitedUser) {
            throw new NotFoundException("Impossible de trouver l'utilisateur invité avec cet email");
        }

        // create invite in database
        const inviteData = {
            documentId: tokenInvitePayload.documentId,
            ownerId,
            sharedUserId: invitedUser.id,
            shareToken: tokenInvite,
            expiresAt: new Date(Date.now() + (5 * 24 * 60 * 60 * 1000)) // 5 days
        } as CreateDocumentShareSchema;

        await this.documentSharesRepository.create(inviteData);
    }
}
