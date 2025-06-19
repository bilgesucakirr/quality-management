export interface UserPreference {
  preferenceId: string;
  userId: string;
  preferenceKey: string;
  preferenceValue?: string | null;
}

export interface CreateUpdateUserPreferenceRequest {
  userId: string;
  preferenceKey: string;
  preferenceValue?: string | null;
}