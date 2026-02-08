import { CSV_MIMETYPES, DOCUMENT_MIMETYPES, IMAGE_MIMETYPES, PDF_MIMETYPES } from "../constants/file-constants"
import { FileTypeEnum } from "../enums/file-enums"

export const getFileType = (mimeType: string): FileTypeEnum => {
    if (PDF_MIMETYPES.includes(mimeType)) return FileTypeEnum.PDF;

    if (CSV_MIMETYPES.includes(mimeType)) return FileTypeEnum.CSV;

    if (DOCUMENT_MIMETYPES.includes(mimeType)) return FileTypeEnum.DOCUMENT;

    if (IMAGE_MIMETYPES.includes(mimeType)) return FileTypeEnum.IMAGE;

    return FileTypeEnum.DOCUMENT;
}