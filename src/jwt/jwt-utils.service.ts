import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtUtilsService {
  constructor(private jwtService: JwtService) {}

  // verify token error
  async verifyToken(token: string): Promise<Record<string, any>> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error: any) {
      if (error instanceof Error) {
        console.log('error: ', error);
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Le token a expiré');
        }
        if (error.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Token invalide');
        }
      }
      throw new UnauthorizedException('Erreur de vérification du token');
    }
  }

  // create JWT token
  async createJWT(
    payload: any,
    options?: { expiresIn?: any; issuer?: string },
  ): Promise<string> {
    const defaultOptions = { expiresIn: '1h', ...options };
    return await this.jwtService.signAsync(payload, defaultOptions);
  }
}
