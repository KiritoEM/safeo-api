import { Inject, Injectable } from "@nestjs/common";
import * as drizzleProvider from 'src/drizzle/drizzle.provider';
import { Document, documents } from "src/drizzle/schemas";
import { CreateDocumentSchema } from "./types";

@Injectable()
export class DocumentRepository {
    constructor(
        @Inject('DrizzleAsyncProvider')
        private readonly db: drizzleProvider.DrizzleDB,
    ) { }

    async create(data: CreateDocumentSchema): Promise<Document[]> {
        return await this.db.insert(documents).values(data).returning();
    }
}