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
    encryptedKey: string;
    encryptedMetadata: string;
    accessLevel: 'private' | 'shareable';
};

export type GetDocumentsFilterSchema = {
    accessLevel?: DocumentAccessLevelEnum;
    fileType?: FileTypeEnum,
    sort?: FileSortingEnum
}

export type UpdateDocumentSchema = Partial<{
    originalName: string;
}>

// response schemas
export type DocumentPublic = Omit<Document, 'encryptedKey' | 'fileName' | 'encryptedMetadata'> & {
    user?: UserPublic;
    publicUrl?: string
};

export interface ICreateDocumentPublic extends BaseApiReturn {
    document?: DocumentPublic;
}
export interface IGetAllDocumentPublic extends BaseApiReturn {
    documents: DocumentPublic[];
}

export interface IUpdateDocumentPublic extends BaseApiReturn {
    document?: DocumentPublic;
}
