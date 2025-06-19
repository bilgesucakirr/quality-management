export interface StaticContent {
  contentKey: string;
  title: string;
  contentBody: string;
  lastUpdatedAt: string;
}

export interface CreateUpdateStaticContentRequest {
  contentKey: string;
  title: string;
  contentBody: string;
}