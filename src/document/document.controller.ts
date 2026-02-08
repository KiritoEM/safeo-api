import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Ip, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiPayloadTooLargeResponse, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import * as cacheManager from 'cache-manager';
import { AuthGuard } from 'src/auth/guards/jwt.guard';
import { DocumentAccessLevelEnum } from 'src/core/enums/document-enums';
import { UserReq } from 'src/core/decorators/user.decorator';
import * as types from 'src/auth/types';
import { ICreateDocumentPublic, IGetAllDocumentPublic } from './types';
import { DocumentService } from './document.service';
import { UploadDocumentDTO, UploadDocumentPublicDTO } from './dtos/upload-document.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { GetAllDocumentQueryDTO, GetAllDocumentResponseDTO } from './dtos/get-all-document.dto';
import { CustomFileValidator } from 'src/core/validators/file.validator';
import type { MulterFile } from 'src/types/multer';

@ApiTags('Document')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Controller('document')
export class DocumentController {
    constructor(private documentService: DocumentService, @Inject(CACHE_MANAGER) private cache: cacheManager.Cache,) { }

    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: "Uploader un document",
    })
    @ApiBody({
        type: UploadDocumentDTO
    })
    @ApiCreatedResponse({
        description: "Document uploadé avec succès",
        type: UploadDocumentPublicDTO,
    })
    @ApiPayloadTooLargeResponse({
        description: 'Espace de stockage insuffisant ou plein',
    })
    @ApiUnprocessableEntityResponse({
        description: 'Fichier invalide (type non autorisé ou taille > 40MB)',
    })
    async uploadDocument(
        @UserReq() user: types.UserPayload,
        @Body() uploadDocumentDTO: UploadDocumentDTO,
        @Ip() Ip,
        @UploadedFile(new CustomFileValidator())
        file: MulterFile
    ): Promise<ICreateDocumentPublic> {
        const createDocument = await this.documentService.uploadFile(
            (uploadDocumentDTO.accessLevel as DocumentAccessLevelEnum),
            file,
            user.id,
            Ip
        )

        return {
            statusCode: HttpStatus.CREATED,
            data: createDocument,
            message: 'Document ajouté avec succés'
        }
    }

    @Get('')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: "Récuperer les documents d'un utilisateur",
    })
    @ApiOkResponse({
        description: 'Documents récupérés avec succès',
        type: GetAllDocumentResponseDTO,
    })
    async getDocuments(
        @UserReq() user: types.UserPayload,
        @Ip() Ip,
        @Query() filterQuery: GetAllDocumentQueryDTO
    ): Promise<IGetAllDocumentPublic> {
        const allDocuments = await this.documentService.getAllDocuments(
            user.id,
            Ip,
            filterQuery
        );

        return {
            statusCode: HttpStatus.OK,
            data: allDocuments,
            message: 'Documents récupérés avec succès'
        }
    }
}
