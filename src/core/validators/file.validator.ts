import {
    PipeTransform,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common';
import { ALL_MIMETYPES } from '../constants/file-constants';
import { MulterFile } from 'src/types/multer';

@Injectable()
export class CustomFileValidator implements PipeTransform<MulterFile> {
    transform(file: MulterFile): MulterFile {
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
