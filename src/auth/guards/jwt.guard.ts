/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserPayload } from '../types';
import { JwtUtilsService } from 'src/jwt/jwt-utils.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtUtilsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const header = request.headers['authorization'];

    if (!header) {
      throw new UnauthorizedException('Header Bearer invalide');
    }

    const token = header.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Pas de token fournis');
    }

    const payload = (await this.jwtService.verifyToken(token)) as UserPayload;

    request['user'] = payload;

    return true;
  }
}
