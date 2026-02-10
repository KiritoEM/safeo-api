// Params schams
export type CreateDocumentShareSchema = {
  documentId: string;
  ownerId: string;
  sharedUserId: string;
  shareToken: string;
  expiresAt: Date;
};

// token invite payload
export type TokenInvitePayload = {
  documentId: string;
  invitedEmail: string;
  invitedUserId: string;
};
