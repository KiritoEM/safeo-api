import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { AuthModule } from 'src/auth/auth.module';
import { EncryptionKeyModule } from 'src/encryption/encryption-key.module';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [DocumentService],
  controllers: [DocumentController],
  imports: [AuthModule, EncryptionKeyModule, UserModule]
})
export class DocumentModule { }
