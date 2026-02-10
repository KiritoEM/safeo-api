import { Module } from '@nestjs/common';
import { EncryptionKeyService } from './encryption-key.service';

@Module({
  providers: [EncryptionKeyService],
  imports: [],
  exports: [EncryptionKeyService],
})
export class EncryptionKeyModule {}
