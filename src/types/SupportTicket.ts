import type { UserResponse } from "./User";

export interface SupportTicket {
  ticketId: string;
  user?: UserResponse | null;
  userId: string;
  subject: string;
  description: string;
  status: string;
  assignedTo?: UserResponse | null;
  assignedToUserId?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateSupportTicketRequest {
  userId: string;
  subject: string;
  description: string;
}

export interface UpdateSupportTicketRequest {
  subject?: string;
  description?: string;
  status?: string;
  assignedToUserId?: string | null;
}