import {
    PipeTransform,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Express } from 'express';
import { ALL_MIMETYPES } from '../constants/file-constants';

@Injectable()
export class CustomFileValidator implements PipeTransform<Express.Multer.File> {
    transform(file: Express.Multer.File): Express.Multer.File {
        if (file.size > 50 * 1024 * 1024) {
            throw new UnprocessableEntityException(
                'Fichier trop volumineux (max 50MB)',
            );
        }

        if (!ALL_MIMETYPES.includes(file.mimetype)) {
            throw new UnprocessableEntityException(
                `Type de fichier non autorisé: ${file.mimetype}`
            );
        }

        return file;
    }
}
