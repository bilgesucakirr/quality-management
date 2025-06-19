export interface LoginAttempt {
  attemptId: string;
  emailOrUsernameAttempted: string;
  ipAddress?: string | null;
  timestamp: string; 
  success: boolean;
}