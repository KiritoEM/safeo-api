import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { AuthModule } from 'src/auth/auth.module';
import { EncryptionKeyModule } from 'src/encryption/encryption-key.module';
import { UserModule } from 'src/user/user.module';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { DocumentRepository } from './document.repository';

@Module({
  providers: [DocumentService, DocumentRepository],
  controllers: [DocumentController],
  imports: [
    AuthModule,
    EncryptionKeyModule,
    UserModule,
    SupabaseModule,
    DrizzleModule
  ]
})
export class DocumentModule { }
