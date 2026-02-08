import { getTableColumns } from "drizzle-orm";
import { documents, users } from "../schemas";

export const { encryptionIv: docIv,
    encryptionKey: docKey, encryptionTag:
    docTag,
    ...documentColumnsPublic
} = getTableColumns(documents);

export const { password,
    encryptionIv: userIv,
    encryptionKey: userKey,
    encryptionTag: userTag,
    refreshToken,
    ...userColumnsPublic } = getTableColumns(users);