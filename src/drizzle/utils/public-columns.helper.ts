import { getTableColumns } from "drizzle-orm";
import { documents, users } from "../schemas";

export const {
    encryptedKey: docEncryptedKey,
    ...documentColumnsPublic
} = getTableColumns(documents);

export const {
    password,
    encryptedKey: userEncryptedKey,
    refreshToken,
    ...userColumnsPublic } = getTableColumns(users);