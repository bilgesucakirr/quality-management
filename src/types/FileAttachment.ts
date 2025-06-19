import type { UserResponse } from "./User";

export interface FileAttachment {
  attachmentId: string;
  originalFilename: string;
  storedFilenameOrPath: string;
  mimeType: string;
  fileSize?: number | null;
  uploadedBy?: UserResponse | null;
  uploadedByUserId: string;
  uploadDate: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
}

export interface CreateFileAttachmentRequest {
  file: File; 
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  uploadedByUserId: string; 
}