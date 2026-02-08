declare namespace Express {
    interface Multer {
        File: {
            fieldname: string;
            originalname: string;
            encoding: string;
            mimetype: string;
            size: number;
            destination?: string;
            filename?: string;
            path?: string;
            buffer?: Buffer;
        };
    }
}

export type MulterFile = Express.Multer.File;
