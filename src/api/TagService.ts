import axiosInstance from "./AxiosInstance";
import type { Tag, CreateTagRequest, EntityTagRequest } from "../types/Tag";

export const getAllTags = async (): Promise<Tag[]> => {
  const response = await axiosInstance.get("/api/tags");
  return response.data;
};

export const createTag = async (data: CreateTagRequest): Promise<Tag> => {
  const response = await axiosInstance.post("/api/tags", data);
  return response.data;
};

export const deleteTag = async (tagId: string): Promise<void> => {
  await axiosInstance.delete(`/api/tags/${tagId}`);
};

export const addTagToEntity = async (data: EntityTagRequest): Promise<void> => {
  await axiosInstance.post("/api/entity-tags", data);
};

export const removeTagFromEntity = async (entityIdValue: string, entityType: string, tagId: string): Promise<void> => {
  await axiosInstance.delete(`/api/entity-tags/entity/${entityType}/${entityIdValue}/tag/${tagId}`);
};

export const getTagsForEntity = async (entityType: string, entityIdValue: string): Promise<Tag[]> => {
    const response = await axiosInstance.get(`/api/entity-tags/entity/${entityType}/${entityIdValue}`);
    return response.data;
};