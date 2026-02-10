import { DocumentAccessLevelEnum } from 'src/core/enums/document-enums';
import { FileSortingEnum, FileTypeEnum } from 'src/core/enums/file-enums';
import { BaseApiReturn } from 'src/core/interfaces';
import { Document } from 'src/drizzle/schemas';
import { UserPublic } from 'src/user/types';

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
  fileType?: FileTypeEnum;
  sort?: FileSortingEnum;
};

export type UpdateDocumentSchema = Partial<{
  originalName: string;
}>;

export type DecryptedDocument<T extends DocumentPublic | SharedDocument> = Omit<
  T,
  'encryptedKey' | 'fileName' | 'encryptedMetadata'
> & {
  publicUrl: string;
};

// response schemas
export interface ICreateDocumentPublic extends BaseApiReturn {
  document?: DocumentPublic;
}
export interface IGetAllDocumentsPublic extends BaseApiReturn {
  documents: DocumentPublic[];
}

export interface IUpdateDocumentPublic extends BaseApiReturn {
  document?: DocumentPublic;
}

export interface IGetSharedDocumentsPublic extends BaseApiReturn {
  documents: SharedDocument[];
}

export interface IDownloadDocument extends BaseApiReturn {
  downloadUrl: string;
  fileName: string;
}

export type DownloadFileSchema = {
  downloadUrl: string;
  originalName: string;
  fileMimeType: string;
  fileSize: number
}

export type DocumentPublic = Omit<
  Document,
  'encryptedKey' | 'fileName' | 'encryptedMetadata'
> & {
  user?: UserPublic;
  publicUrl?: string;
};

export type SharedDocument = Omit<
  Document,
  'encryptedKey' | 'fileName' | 'encryptedMetadata'
> & {
  isOwner: boolean;
  ownerUser: UserPublic;
  publicUrl?: string;
};
