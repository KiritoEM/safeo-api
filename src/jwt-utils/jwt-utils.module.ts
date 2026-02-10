import { Module } from '@nestjs/common';
import { JwtUtilsService } from 'src/jwt/jwt-utils.service';

@Module({
  providers: [JwtUtilsService],
  exports: [JwtUtilsService],
})
export class JwtUtilsModule {}
