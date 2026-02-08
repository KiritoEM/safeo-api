import { Body, Controller, HttpCode, HttpStatus, Ip, ParseFilePipeBuilder, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/guards/jwt.guard';
import { UploadDocumentDTO } from './dtos/upload-document.dto';
import { DocumentService } from './document.service';
import { DocumentAccessLevelEnum } from 'src/core/enums/document-enums';
import { UserReq } from 'src/core/decorators/user.decorator';
import * as types from 'src/auth/types';
import { AUTHORIZED_FILE_EXTENSION } from 'src/core/constants/file-constants';
import { ICreateDocumentResponse } from './types';

@ApiTags('Document')
@ApiBearerAuth('JWT-auth')
@Controller('document')
export class DocumentController {
    constructor(private documentService: DocumentService) { }

    @Post('upload')
    @UseGuards(AuthGuard)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: "Uploader un document",
    })
    @ApiBody({
        type: UploadDocumentDTO
    })
    async uploadDocument(
        @UserReq() user: types.UserPayload,
        @Body() uploadDocumentDTO: UploadDocumentDTO,
        @Ip() Ip,
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: AUTHORIZED_FILE_EXTENSION
                })
                .addMaxSizeValidator({
                    maxSize: 40 * 1024 * 1024 //40MB max
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
                }),
        )
        file: Express.Multer.File
    ): Promise<ICreateDocumentResponse> {
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
}
