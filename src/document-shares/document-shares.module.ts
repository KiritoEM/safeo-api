import { Module } from '@nestjs/common';
import { JwtUtilsModule } from 'src/jwt-utils/jwt-utils.module';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { DocumentSharesController } from './document-shares.controller';
import { DocumentSharesService } from './document-shares.service';
import { DocumentSharesRepository } from './document-shares.repository';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
    imports: [
        MailModule,
        UserModule,
        JwtUtilsModule,
        DrizzleModule
    ],
    controllers: [DocumentSharesController],
    providers: [
        DocumentSharesService,
        DocumentSharesRepository
    ]
})
export class DocumentSharesModule { }
