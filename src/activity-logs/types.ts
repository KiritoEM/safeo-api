import { AUDIT_ACTIONS, AUDIT_TARGET } from './constants';

// Params schemas
export type CreateActivityLogSchema = {
  action: AUDIT_ACTIONS;
  target: AUDIT_TARGET;
  ipAddress?: string;
  userId: string;
};
