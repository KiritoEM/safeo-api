import { MulterFile } from "src/types/multer";

// Params schemas
export type uploadFileSchema = {
    file: Buffer,
    fileMimetype: string,
    originalFileName: MulterFile['originalname']
}

// Responses schemas
export type uploadFileResponse = {
    path: string;
    fullPath: string
}