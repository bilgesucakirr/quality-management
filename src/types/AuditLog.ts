import type { UserResponse } from "./User";

export interface AuditLog {
  logId: string;
  user?: UserResponse | null;
  userId?: string | null;
  actionType: string;
  timestamp: string;
  details?: string | null;
  ipAddress?: string | null;
  entityType?: string | null;
  entityId?: string | null;
}