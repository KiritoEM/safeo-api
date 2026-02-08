import { BaseApiReturn } from "src/core/interfaces";
import { Document } from "src/drizzle/schemas";

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
    accessLevel: 'private' | 'shareable';
};

// response schemas
export type PublicDocument = Omit<Document, 'encryptionKey' | 'encryptionIv' | 'encryptionTag' | 'bucketPath' | 'fileName'>;

export interface ICreateDocumentResponse extends BaseApiReturn {
    data?: PublicDocument;
}
