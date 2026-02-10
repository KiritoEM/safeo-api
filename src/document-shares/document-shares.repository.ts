import { and, eq } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import * as drizzleProvider from 'src/drizzle/drizzle.provider';
import { documents, DocumentShares, documentShares } from 'src/drizzle/schemas';
import { CreateDocumentShareSchema } from './types';

@Injectable()
export class DocumentSharesRepository {
  constructor(
    @Inject('DrizzleAsyncProvider')
    private readonly db: drizzleProvider.DrizzleDB,
  ) { }

  async create(data: CreateDocumentShareSchema): Promise<DocumentShares[]> {
    return await this.db.insert(documentShares).values(data).returning();
  }

  async findByShareToken(token: string) {
    await this.db.query.documentShares.findFirst({
      where: eq(documentShares.shareToken, token),
    });
  }

  async delete(userId: string, userIdToRemove: string, documentId: string) {
    await this.db.delete(documents).where(
      and(
        eq(documentShares.documentId, documentId),
        eq(documentShares.ownerId, userId),
        eq(documentShares.sharedUserId, userIdToRemove)
      )
    );
  }
}
