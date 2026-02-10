import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { EncryptionKeyModule } from 'src/encryption/encryption-key.module';
import { UserModule } from 'src/user/user.module';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { DocumentRepository } from './document.repository';
import { JwtUtilsModule } from 'src/jwt-utils/jwt-utils.module';

@Module({
  providers: [DocumentService, DocumentRepository],
  controllers: [DocumentController],
  imports: [
    EncryptionKeyModule,
    UserModule,
    SupabaseModule,
    DrizzleModule,
    JwtUtilsModule
  ]
})
export class DocumentModule { }
