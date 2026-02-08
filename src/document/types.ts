import { DocumentAccessLevelEnum } from "src/core/enums/document-enums";
import { FileSortingEnum, FileTypeEnum } from "src/core/enums/file-enums";
import { BaseApiReturn } from "src/core/interfaces";
import { Document } from "src/drizzle/schemas";
import { UserPublic } from "src/user/types";

// Params schemas
export type CreateDocumentSchema = {
    userId: string;
    fileName: string;
    originalName: string;
    fileSize: number;
    fileType: 'pdf' | 'docs' | 'image' | 'csv';
    fileMimeType: string;
    filePath: string;
    bucketPath?: string;
    encryptionKey: string;
    encryptionIv: string;
    encryptionTag: string;
    encryptedMetadata: Record<string, string>;
    accessLevel: 'private' | 'shareable';
};

export type GetDocumentsFilterSchema = {
    accessLevel?: DocumentAccessLevelEnum;
    fileType?: FileTypeEnum,
    sort?: FileSortingEnum
}

// response schemas
export type DocumentPublic = Omit<Document, 'encryptionKey' | 'encryptionIv' | 'encryptionTag' | 'bucketPath' | 'fileName' | 'encryptedMetadata'> & {
    user?: UserPublic;
    publicUrl?: string
};

export interface ICreateDocumentPublic extends BaseApiReturn {
    document?: DocumentPublic;
}
export interface IGetAllDocumentPublic extends BaseApiReturn {
    documents: DocumentPublic[];
}
