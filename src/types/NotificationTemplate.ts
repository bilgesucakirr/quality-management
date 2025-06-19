export interface NotificationTemplate {
  templateId: string;
  templateName: string;
  subjectTemplate: string;
  bodyTemplate: string;
  type: string;
}

export interface CreateUpdateNotificationTemplateRequest {
  templateName: string;
  subjectTemplate: string;
  bodyTemplate: string;
  type: string;
}