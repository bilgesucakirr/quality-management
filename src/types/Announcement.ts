import type { UserResponse } from "./User";

export interface Announcement {
  announcementId: string;
  title: string;
  content: string;
  publishDate: string;
  expiryDate?: string | null;
  author?: UserResponse | null;
  authorId: string;
  createdAt: string;
}

export interface CreateUpdateAnnouncementRequest {
  title: string;
  content: string;
  publishDate: string;
  expiryDate?: string | null;
  authorId: string;
}