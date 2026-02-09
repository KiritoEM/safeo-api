import { Module } from '@nestjs/common';
import { JwtUtilsModule } from 'src/jwt-utils/jwt-utils.module';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { DocumentSharesController } from './document-shares.controller';
import { DocumentSharesService } from './document-shares.service';

@Module({
    imports: [
        MailModule,
        UserModule,
        JwtUtilsModule
    ],
    controllers: [DocumentSharesController],
    providers: [DocumentSharesService, DocumentSharesService]
})
export class DocumentSharesModule { }
