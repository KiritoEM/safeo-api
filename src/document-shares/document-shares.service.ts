import { UserRepository } from 'src/user/user.repository';
import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { JwtUtilsService } from 'src/jwt/jwt-utils.service';
import { MailService } from 'src/mail/mail.service';
import { INVITE_BASE_URL } from './constants';

@Injectable()
export class DocumentSharesService {
    private readonly logger = new Logger(DocumentSharesService.name);

    constructor(
        private jwtService: JwtUtilsService,
        private mailService: MailService,
        private UserRepository: UserRepository
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
        };

        const tokenLink = await this.jwtService.createJWT(linkJWTPayload, {
            expiresIn: '5d'
        });

        const inviteLink = `${INVITE_BASE_URL}?token=${tokenLink}`;

        // send link to invited email
        try {
            await this.mailService.sendEmail({
                subject: `${user.fullName} vous a invité à voir un document`,
                to: invitedEmail,
                template: 'send-invitation',
                context: {
                    inviterName: user.fullName,
                    inviteLink
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
}
