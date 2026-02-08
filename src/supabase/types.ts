// Params schemas
export type uploadFileSchema = {
    file: Buffer,
    fileMimetype: string,
    originalFileName: Express.Multer.File['originalname']
}

// Responses schemas
export type uploadFileResponse = {
    path: string;
    fullPath: string
}