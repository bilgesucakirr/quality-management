import type { UserResponse } from "./User";

export interface ApplicationErrorLog {
  errorLogId: string;
  timestamp: string; 
  errorLevel: string;
  loggerName?: string | null;
  message: string;
  stackTrace?: string | null;
  user?: UserResponse | null;
  userId?: string | null;
}