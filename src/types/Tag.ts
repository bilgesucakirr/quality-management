export interface Tag {
  tagId: string;
  tagName: string;
}

export interface CreateTagRequest {
  tagName: string;
}

export interface EntityTagRequest {
  entityIdValue: string;
  entityType: string;
  tagId: string;
}