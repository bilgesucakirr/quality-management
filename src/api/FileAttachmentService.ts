import axiosInstance from "./AxiosInstance";
import type { FileAttachment, CreateFileAttachmentRequest } from "../types/FileAttachment";

export const uploadFileAttachment = async (data: CreateFileAttachmentRequest): Promise<FileAttachment> => {
  const formData = new FormData();
  formData.append("file", data.file);
  if (data.relatedEntityType) formData.append("relatedEntityType", data.relatedEntityType);
  if (data.relatedEntityId) formData.append("relatedEntityId", data.relatedEntityId);
  formData.append("uploadedByUserId", data.uploadedByUserId);

  const response = await axiosInstance.post("/api/file-attachments/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getFileAttachmentsForEntity = async (entityType: string, entityId: string): Promise<FileAttachment[]> => {
  const response = await axiosInstance.get(`/api/file-attachments/entity/${entityType}/${entityId}`);
  return response.data;
};

export const getFileAttachmentById = async (attachmentId: string): Promise<FileAttachment> => {
  const response = await axiosInstance.get(`/api/file-attachments/${attachmentId}`);
  return response.data;
};

export const deleteFileAttachment = async (attachmentId: string): Promise<void> => {
  await axiosInstance.delete(`/api/file-attachments/${attachmentId}`);
};