import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { UploadFileResponse, uploadFileSchema } from './types';

@Injectable()
export class SupabaseService {
  private imageBucket: string = 'images';
  private documentBucket: string = 'documents';

  constructor(
    @Inject('Supabase_client') private readonly supabase: SupabaseClient,
  ) { }

  // upload file to supabase storage
  async uploadFile(data: uploadFileSchema): Promise<UploadFileResponse> {
    const fileName = `${Date.now()}-${data.originalFileName}`;

    const bucket =
      this.getFileType(data.fileMimetype) === 'DOCUMENT'
        ? this.documentBucket
        : this.imageBucket;

    const { data: resultData, error } = await this.supabase.storage
      .from(bucket)
      .upload(fileName, data.file, {
        contentType: data.fileMimetype,
        upsert: false,
        cacheControl: '3600',
      });

    if (error) throw new BadRequestException(error.message);

    return {
      path: resultData.path,
      fullPath: resultData.fullPath,
    };
  }

  // get file type (Document or Image)
  getFileType(mimeType: string): 'IMAGE' | 'DOCUMENT' {
    if (mimeType.startsWith('image')) return 'IMAGE';

    return 'DOCUMENT';
  }

  // create signed URL for file access
  async createSignedURL(
    fileMimeType: string,
    bucketPath: string,
    expiresIn: number,
  ): Promise<string> {
    const bucket =
      this.getFileType(fileMimeType) === 'DOCUMENT'
        ? this.documentBucket
        : this.imageBucket;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(bucketPath, expiresIn);

    if (error) throw new BadRequestException(error.message);

    return data.signedUrl;
  }

  // download image from the private bucket
  async downloadFile(fileMimeType: string, bucketPath: string,): Promise<Blob> {
    const bucket =
      this.getFileType(fileMimeType) === 'DOCUMENT'
        ? this.documentBucket
        : this.imageBucket;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .download(bucketPath);

    if (error) throw new BadRequestException(error.message);

    return data;
  }
}
