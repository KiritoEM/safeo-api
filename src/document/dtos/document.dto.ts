import { ApiProperty } from '@nestjs/swagger';
import { DocumentAccessLevelEnum } from 'src/core/enums/document-enums';
import { FileTypeEnum } from 'src/core/enums/file-enums';

export class DocumentDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    type: 'string',
  })
  originalName!: string;

  @ApiProperty({
    type: 'number',
  })
  fileSize!: number;

  @ApiProperty({
    type: 'string',
  })
  fileMimeType!: string;

  @ApiProperty({
    enum: FileTypeEnum,
    default: FileTypeEnum.DOCUMENT,
  })
  fileType!: FileTypeEnum;

  @ApiProperty({
    enum: DocumentAccessLevelEnum,
    required: false,
  })
  accessLevel?: DocumentAccessLevelEnum;

  @ApiProperty({
    type: 'boolean',
    default: false,
  })
  isDeleted!: boolean;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  deletedAt?: Date;

  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt!: Date;
}
