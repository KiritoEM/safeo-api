import { UserService } from './user.service';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/jwt.guard';
import * as types from 'src/auth/types';
import { UserReq } from 'src/core/decorators/user.decorator';
import { IGetUserInfoResponse, UserPublic } from './types';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { GetUserInfoResponseDTO } from './dtos/get-user-dto';

@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Récupérer les informastions de l'utilisateur ",
  })
  @ApiCreatedResponse({
    description: 'Document uploadé avec succès',
    type: GetUserInfoResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Utilisateur introuvable',
  })
  async getUserInfo(
    @UserReq() userReq: types.UserPayload,
    @Ip() Ip,
  ): Promise<IGetUserInfoResponse> {
    const user = await this.userService.getUserById(userReq.id, Ip);

    return {
      statusCode: HttpStatus.OK,
      user: user as UserPublic,
      message: '',
    };
  }
}
