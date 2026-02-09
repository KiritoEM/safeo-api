import { Controller, Post } from '@nestjs/common';

@Controller('document-shares')
export class DocumentSharesController {
    @Post('share/:documentId')
    async shareFile() {
        
    }
}
