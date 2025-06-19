import type { UserResponse } from "./User";

export interface SystemSetting {
  settingKey: string;
  settingValue?: string | null;
  description?: string | null;
  lastUpdatedAt: string;
  lastUpdatedBy?: UserResponse | null;
  lastUpdatedByUserId?: string | null;
}

export interface CreateUpdateSystemSettingRequest {
  settingKey: string;
  settingValue?: string | null;
  description?: string | null;
}