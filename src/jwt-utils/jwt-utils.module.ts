import { Module } from '@nestjs/common';
import { JwtUtilsService } from 'src/jwt-utils/jwt-utils.service';

@Module({
  providers: [JwtUtilsService],
  exports: [JwtUtilsService],
})
export class JwtUtilsModule {}
