/* eslint-disable @typescript-eslint/no-unused-vars */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "../auth.service";
import { UserPayload } from "../types";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService
    ) { }

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

        try {
            const payload = await this.authService.verifyToken(token) as UserPayload;
            request['user'] = payload;
        }
        catch (err) {
            throw new UnauthorizedException('Token invalide ou expiré');
        }

        return true;

    }
}