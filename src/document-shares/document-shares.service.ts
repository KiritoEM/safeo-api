import { UserRepository } from 'src/user/user.repository';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtUtilsService } from 'src/jwt-utils/jwt-utils.service';
import { MailService } from 'src/mail/mail.service';
import { INVITE_BASE_URL } from './constants';
import { DocumentSharesRepository } from './document-shares.repository';
import { CreateDocumentShareSchema, TokenInvitePayload } from './types';
import { DocumentRepository } from 'src/document/document.repository';

@Injectable()
export class DocumentSharesService {
  private readonly logger = new Logger(DocumentSharesService.name);

  constructor(
    private jwtService: JwtUtilsService,
    private mailService: MailService,
    private UserRepository: UserRepository,
    private documentSharesRepository: DocumentSharesRepository,
    private documentRepository: DocumentRepository,
  ) { }

  //share email link
  async shareEmailLink(
    userId: string,
    documentId: string,
    invitedEmail: string,
  ) {
    const user = await this.UserRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const invitedUser = await this.UserRepository.findUserByEmail(
      invitedEmail,
    );

    if (!invitedUser) {
      throw new NotFoundException(
        "Impossible de trouver l'utilisateur invité avec cet email",
      );
    }

    if (user.email.trim() === invitedEmail.trim()) {
      throw new ConflictException(
        'Le proprietaire ne peut pas partager le fichier avec son propre email',
      );
    }

    const linkJWTPayload = {
      documentId,
      invitedUserId: invitedUser.id,
      invitedEmail,
    } as TokenInvitePayload;

    const tokenInvite = await this.jwtService.createJWT(linkJWTPayload, {
      expiresIn: '5d',
    });

    const appLink = `${INVITE_BASE_URL}?token=${tokenInvite}`;

    this.logger.log(appLink);

    try {
      await this.mailService.sendEmail({
        subject: `${user.fullName} vous a invité à voir un document`,
        to: invitedEmail,
        template: 'send-invitation',
        context: {
          inviterName: user.fullName,
          inviteLink: appLink,
        },
      });
    } catch (err) {
      this.logger.error('Failed to send OTP to user: ', err);
      throw new InternalServerErrorException(
        "Impossible d'envoyer le lien d'invitation",
      );
    }
  }

  // accept invite by token
  async acceptInvite(currentUserId: string, currentUserEmail: string, tokenInvite: string) {
    const tokenInvitePayload = (await this.jwtService.verifyToken(
      tokenInvite,
    )) as TokenInvitePayload;

    if (!tokenInvitePayload) {
      throw new UnauthorizedException(
        "Impossible de récuperer les informations dans le jeton d'invitation",
      );
    }

    if (currentUserEmail.trim() !== tokenInvitePayload.invitedEmail.trim()) {
      throw new UnauthorizedException(
        "Cette invitation n'est pas destinée à votre compte",
      );
    }

    const document = await this.documentRepository.findById(
      tokenInvitePayload.documentId
    );

    if (!document) {
      throw new NotFoundException('Document introuvable');
    }

    if (document.userId === currentUserId) {
      throw new ConflictException(
        'Vous êtes déjà propriétaire de ce document',
      );
    }

    const inviteData = {
      documentId: tokenInvitePayload.documentId,
      ownerId: document.userId,
      sharedUserId: currentUserId,
      shareToken: tokenInvite,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    } as CreateDocumentShareSchema;

    await this.documentSharesRepository.create(inviteData);
  }

  // delete an invite
  async deleteInvite(userId: string, documentId: string, userIdToRemoved: string) {
    await this.documentSharesRepository.delete(userId, userIdToRemoved, documentId);
  }
}