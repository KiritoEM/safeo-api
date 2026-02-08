import { and, desc, eq, getTableColumns, not, SQLWrapper } from "drizzle-orm";
import { Inject, Injectable } from "@nestjs/common";
import * as drizzleProvider from 'src/drizzle/drizzle.provider';
import { Document, documents, users } from "src/drizzle/schemas";
import { userColumnsPublic } from "src/drizzle/utils/public-columns.helper";
import { FileSortingEnum } from "src/core/enums/file-enums";
import { CreateDocumentSchema, DocumentPublic, GetDocumentsFilterSchema, UpdateDocumentSchema } from "./types";

@Injectable()
export class DocumentRepository {
    constructor(
        @Inject('DrizzleAsyncProvider')
        private readonly db: drizzleProvider.DrizzleDB,
    ) { }

    async create(data: CreateDocumentSchema): Promise<Document[]> {
        return await this.db.insert(documents).values(data).returning();
    }

    async fetchAll(userId: string, filterQuery?: GetDocumentsFilterSchema) {
        const conditions = [
            eq(documents.userId, userId),
            not(eq(documents.isDeleted, true))
        ];

        // Filters query
        if (filterQuery?.fileType) {
            conditions.push(eq(documents.fileType, filterQuery.fileType as "pdf" | "docs" | "image" | "csv"));
        }

        let sortByColumn: SQLWrapper;

        if (filterQuery?.sort === FileSortingEnum.DOCUMENT_NAME) {
            sortByColumn = documents.originalName;
        } else if (filterQuery?.sort === FileSortingEnum.DOCUMENT_DATE_CREATION) {
            sortByColumn = documents.createdAt;
        } else if (filterQuery?.sort === FileSortingEnum.DOCUMENT_TYPE) {
            sortByColumn = documents.fileType;
        } else {
            sortByColumn = documents.createdAt;
        }

        return await this.db
            .select({
                ...getTableColumns(documents),
                user: userColumnsPublic,
            })
            .from(documents)
            .rightJoin(users, eq(documents.userId, users.id))
            .where(and(...conditions))
            .orderBy(desc(sortByColumn));
    }

    async update(documentId: string, userId: string, data: UpdateDocumentSchema): Promise<DocumentPublic[]> {
        return this.db
            .update(documents)
            .set(data)
            .where(
                and(
                    eq(documents.userId, userId),
                    eq(documents.id, documentId)
                )
            )
            .returning()
    }

    async softDelete(documentId: string, userId: string): Promise<Document[]> {
        return this.db
            .update(documents)
            .set({
                isDeleted: true,
                deletedAt: new Date()
            })
            .where(
                and(
                    eq(documents.userId, userId),
                    eq(documents.id, documentId)
                )
            )
            .returning()
    }
}
