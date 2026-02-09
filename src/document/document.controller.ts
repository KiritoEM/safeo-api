import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Ip, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiPayloadTooLargeResponse, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import * as cacheManager from 'cache-manager';
import { AuthGuard } from 'src/auth/guards/jwt.guard';
import { DocumentAccessLevelEnum } from 'src/core/enums/document-enums';
import { UserReq } from 'src/core/decorators/user.decorator';
import * as types from 'src/auth/types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CustomFileValidator } from 'src/core/validators/file.validator';
import type { MulterFile } from 'src/types/multer';
import { UpdateDocumentDTO, UpdateDocumentResponseDTO } from './dtos/update-document.dto';
import { DocumentService } from './document.service';
import { GetAllDocumentQueryDTO, GetAllDocumentResponseDTO } from './dtos/get-all-document.dto';
import { ICreateDocumentPublic, IGetAllDocumentPublic, IUpdateDocumentPublic } from './types';
import { UploadDocumentDTO, UploadDocumentPublicDTO } from './dtos/upload-document.dto';

@ApiTags('Document')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Controller('document')
export class DocumentController {
    constructor(private documentService: DocumentService, @Inject(CACHE_MANAGER) private cache: cacheManager.Cache,) { }


    @Throttle({ short: { limit: 20, ttl: 6000 } }) // 20/minute
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
        const createdDocument = await this.documentService.uploadFile(
            (uploadDocumentDTO.accessLevel as DocumentAccessLevelEnum),
            file,
            user.id,
            Ip
        )

        return {
            statusCode: HttpStatus.CREATED,
            document: createdDocument,
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
            documents: allDocuments,
            message: 'Documents récupérés avec succès'
        }
    }

    @Throttle({ short: { limit: 20, ttl: 6000 } }) // 20/minute
    @Patch(':documentId')
    @HttpCode(HttpStatus.OK)
    @ApiParam({
        name: 'documentId',
        description: 'Id du document à mettre à jour',
        required: true,
        type: String,
    })
    @ApiOperation({
        summary: "Mettre à jour un document",
    })
    @ApiOkResponse({
        description: 'Document mis à jour avec succès',
        type: UpdateDocumentResponseDTO,
    })
    @ApiNotFoundResponse({
        description: 'Utilisateur introuvable',
    })
    async updateDocument(
        @Param('documentId') documentId: string,
        @UserReq() user: types.UserPayload,
        @Ip() Ip,
        @Body() body: UpdateDocumentDTO
    ): Promise<IUpdateDocumentPublic> {
        const updatedDocument = await this.documentService.updateDocumentMetadata(
            user.id,
            documentId,
            {
                originalName: body.fileName
            },
            Ip,
        );

        return {
            statusCode: HttpStatus.OK,
            document: updatedDocument,
            message: 'Document mis à jour avec succès'
        }
    }

    @Delete(':documentId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiParam({
        name: 'documentId',
        description: 'Id du document à supprimer',
        required: true,
        type: String,
    })
    @ApiOperation({
        summary: "Supprimer un document",
    })
    @ApiOkResponse({
        description: 'Document supprimé avec succès',
        type: UpdateDocumentResponseDTO,
    })
    @ApiNotFoundResponse({
        description: 'Utilisateur introuvable',
    })
    async deleteDocument(
        @Param('documentId') documentId: string,
        @UserReq() user: types.UserPayload,
        @Ip() Ip,
    ): Promise<IUpdateDocumentPublic> {
        await this.documentService.deleteDocument(
            user.id,
            documentId,
            Ip,
        );

        return {
            statusCode: HttpStatus.NO_CONTENT,
            message: 'Document supprimé avec succès'
        }
    }
}
