/**
 * Form Data Normalizer
 *
 * Normalizes form data from different blog creation modes (autopilot, copilot, bulk)
 * into a consistent format before sending to the backend API.
 *
 * This ensures the backend receives a predictable data structure regardless of
 * which form was used to create the content.
 */

// Word count presets - maps string values to min/max ranges
export const WORD_COUNT_PRESETS: Record<string, { min: number; max: number }> = {
  small: { min: 800, max: 1200 },
  medium: { min: 1200, max: 1800 },
  large: { min: 1800, max: 2500 },
  extra_large: { min: 2500, max: 3500 },
};

// Language name to code mapping
export const LANGUAGE_MAP: Record<string, string> = {
  english: 'en',
  french: 'fr',
  spanish: 'es',
  german: 'de',
  italian: 'it',
  portuguese: 'pt',
  dutch: 'nl',
  russian: 'ru',
  chinese: 'zh',
  japanese: 'ja',
  korean: 'ko',
  arabic: 'ar',
  hindi: 'hi',
  bengali: 'bn',
  bangla: 'bn',
  turkish: 'tr',
  polish: 'pl',
  vietnamese: 'vi',
  thai: 'th',
  indonesian: 'id',
  malay: 'ms',
};

// Region code to country name mapping
export const REGION_MAP: Record<string, string> = {
  us: 'United States',
  uk: 'United Kingdom',
  gb: 'United Kingdom',
  ca: 'Canada',
  au: 'Australia',
  de: 'Germany',
  fr: 'France',
  es: 'Spain',
  it: 'Italy',
  br: 'Brazil',
  mx: 'Mexico',
  in: 'India',
  jp: 'Japan',
  kr: 'South Korea',
  cn: 'China',
  bd: 'Bangladesh',
  global: 'Global',
};

/**
 * Normalizes word count to {min, max} format
 *
 * Handles:
 * - Object format: { min: 1500, max: 1800 } - passes through
 * - String format: 'small', 'medium', 'large' - converts to object
 * - Number format: 1500 - converts to range
 */
export function normalizeWordCount(
  wordCount: string | { min: number; max: number } | number | undefined
): { min: number; max: number } {
  // Default values
  const defaultWordCount = { min: 1200, max: 1800 };

  if (!wordCount) {
    return defaultWordCount;
  }

  // Already in correct format
  if (typeof wordCount === 'object' && 'min' in wordCount && 'max' in wordCount) {
    return {
      min: Number(wordCount.min) || defaultWordCount.min,
      max: Number(wordCount.max) || defaultWordCount.max,
    };
  }

  // String preset (copilot/bulk mode)
  if (typeof wordCount === 'string') {
    const preset = WORD_COUNT_PRESETS[wordCount.toLowerCase()];
    if (preset) {
      return preset;
    }
    // Try parsing as number
    const parsed = parseInt(wordCount, 10);
    if (!isNaN(parsed)) {
      return { min: Math.max(500, parsed - 200), max: parsed + 200 };
    }
    return defaultWordCount;
  }

  // Number format
  if (typeof wordCount === 'number') {
    return { min: Math.max(500, wordCount - 200), max: wordCount + 200 };
  }

  return defaultWordCount;
}

/**
 * Normalizes language to language code
 *
 * Handles:
 * - Language codes: 'en', 'fr', 'es' - passes through
 * - Full names: 'english', 'french', 'spanish' - converts to code
 */
export function normalizeLanguage(language: string | undefined): string {
  if (!language) {
    return 'en';
  }

  const lang = language.toLowerCase().trim();

  // If it's already a short code, return it
  if (lang.length <= 3) {
    return lang;
  }

  // Try to map from full name
  return LANGUAGE_MAP[lang] || lang;
}

/**
 * Normalizes region to country name
 *
 * Handles:
 * - Region codes: 'us', 'uk' - converts to full name
 * - Full names: 'United States' - passes through
 */
export function normalizeCountry(region: string | undefined): string {
  if (!region) {
    return 'Global';
  }

  const regionLower = region.toLowerCase().trim();

  // Check if it's a region code
  if (REGION_MAP[regionLower]) {
    return REGION_MAP[regionLower];
  }

  // Assume it's already a country name or custom input
  return region;
}

/**
 * Main normalizer function - normalizes all form data fields
 *
 * This ensures consistent data format regardless of which form
 * (autopilot, copilot, bulk) was used.
 */
export function normalizeFormData<T extends Record<string, unknown>>(data: T): T {
  // Create a mutable copy for normalization
  const normalized: Record<string, unknown> = { ...data };

  // Normalize word count
  if ('wordCount' in normalized) {
    normalized['wordCount'] = normalizeWordCount(
      normalized['wordCount'] as string | { min: number; max: number } | number | undefined
    );
  }

  // Normalize language
  if ('language' in normalized) {
    normalized['language'] = normalizeLanguage(normalized['language'] as string | undefined);
  }

  // Normalize region to country
  if ('region' in normalized) {
    // Keep region as-is for backward compatibility, but also add country
    normalized['country'] = normalizeCountry(normalized['region'] as string | undefined);
  }

  // Merge singular videoUrl into videoUrls array and remove the singular field
  if ('videoUrl' in normalized && normalized['videoUrl']) {
    const existingVideoUrls = (normalized['videoUrls'] as string[] | undefined) || [];
    const videoUrl = normalized['videoUrl'] as string;
    if (!existingVideoUrls.includes(videoUrl)) {
      normalized['videoUrls'] = [...existingVideoUrls, videoUrl];
    }
    delete normalized['videoUrl'];
  }

  return normalized as T;
}

/**
 * Type-safe version that preserves the original type but normalizes the data
 */
export type NormalizedFormData<T> = Omit<T, 'wordCount'> & {
  wordCount: { min: number; max: number };
  country?: string;
};
