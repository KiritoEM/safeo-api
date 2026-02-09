import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { EncryptionKeyModule } from 'src/encryption/encryption-key.module';
import { UserModule } from 'src/user/user.module';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { DocumentRepository } from './document.repository';
import { JwtUtilsService } from 'src/jwt/jwt-utils.service';

@Module({
  providers: [DocumentService, DocumentRepository, JwtUtilsService],
  controllers: [DocumentController],
  imports: [
    EncryptionKeyModule,
    UserModule,
    SupabaseModule,
    DrizzleModule
  ]
})
export class DocumentModule { }
