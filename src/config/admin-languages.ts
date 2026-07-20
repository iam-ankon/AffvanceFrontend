export interface AdminLanguage {
  code: string;
  name: string;
  enabled: boolean;
}

// Admin-managed languages configuration
// These languages will be available in addition to API-provided languages
export const adminLanguages: AdminLanguage[] = [
  { code: 'en', name: 'English', enabled: true },
  { code: 'es', name: 'Spanish', enabled: true },
  { code: 'de', name: 'German', enabled: true },
  { code: 'zh-CN', name: 'Chinese (Simplified)', enabled: true },
  { code: 'hi', name: 'Hindi', enabled: true },
  { code: 'bn', name: 'Bengali (Bangla)', enabled: true }
];

// Get enabled admin languages
export function getEnabledAdminLanguages(): AdminLanguage[] {
  return adminLanguages.filter(lang => lang.enabled);
}

// Get all admin languages (for admin management)
export function getAllAdminLanguages(): AdminLanguage[] {
  return adminLanguages;
}
