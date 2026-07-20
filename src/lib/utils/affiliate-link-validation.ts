const AMAZON_ASIN_PATTERN = /^[A-Z0-9]{10}$/i;

const AMAZON_HOST_SUFFIXES = [
  'amazon.com',
  'amazon.co.uk',
  'amazon.de',
  'amazon.fr',
  'amazon.ca',
  'amazon.in',
  'amazon.it',
  'amazon.es',
  'amazon.com.au',
  'amazon.co.jp',
  'amazon.com.mx',
  'amazon.com.br',
  'amazon.nl',
  'amazon.se',
  'amazon.pl',
  'amazon.sg',
  'amazon.ae',
  'amazon.sa',
  'amazon.eg',
  'amazon.com.tr',
  'amazon.cn'
];

const AMAZON_SHORT_LINK_HOSTS = new Set(['amzn.to', 'a.co']);

const AMAZON_ASIN_IN_PATH =
  /\/(?:dp|gp\/product|gp\/aw\/d|exec\/obidos\/ASIN|product)\/([A-Z0-9]{10})(?:[/?]|$)/i;

export function isAmazonAsin(link: string): boolean {
  const raw = (link || '').trim().toUpperCase();
  if (!AMAZON_ASIN_PATTERN.test(raw)) {
    return false;
  }
  if (/^(.)\1{9}$/.test(raw)) {
    return false;
  }
  if (/^[A-Z]{10}$/.test(raw)) {
    return false;
  }
  return true;
}

function isAmazonHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, '');
  if (AMAZON_SHORT_LINK_HOSTS.has(host)) {
    return true;
  }
  return AMAZON_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`)
  );
}

function extractAsinFromAmazonUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    const pathMatch = parsed.pathname.match(AMAZON_ASIN_IN_PATH);
    if (pathMatch?.[1] && isAmazonAsin(pathMatch[1])) {
      return pathMatch[1].toUpperCase();
    }

    const asinParam = parsed.searchParams.get('asin');
    if (asinParam && isAmazonAsin(asinParam)) {
      return asinParam.toUpperCase();
    }

    const dpMatch = parsed.pathname.match(/\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i);
    if (dpMatch?.[1] && isAmazonAsin(dpMatch[1])) {
      return dpMatch[1].toUpperCase();
    }
  } catch {
    return null;
  }
  return null;
}

export function isValidAmazonProductUrl(link: string): boolean {
  const raw = (link || '').trim();
  if (!/^https?:\/\//i.test(raw)) {
    return false;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    if (!isAmazonHostname(host)) {
      return false;
    }

    if (AMAZON_SHORT_LINK_HOSTS.has(host)) {
      return parsed.pathname.length > 1;
    }

    return extractAsinFromAmazonUrl(raw) !== null;
  } catch {
    return false;
  }
}

/**
 * Valid http(s) URL with a real domain (used for non-Amazon affiliate platforms).
 */
export function isValidHttpUrl(link: string): boolean {
  const raw = (link || '').trim();
  if (!/^https?:\/\//i.test(raw)) {
    return false;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    if (!host || host.length < 3) {
      return false;
    }

    if (host === 'localhost') {
      return true;
    }

    return host.includes('.');
  } catch {
    return false;
  }
}

/**
 * Amazon: valid 10-character ASIN or Amazon product URL with extractable ASIN.
 * Other platforms: valid http(s) URL with a real domain.
 */
export function isValidAffiliateLink(link: string, platform = 'amazon'): boolean {
  const raw = (link || '').trim();
  if (!raw) {
    return false;
  }

  if (platform === 'amazon') {
    return isAmazonAsin(raw) || isValidAmazonProductUrl(raw);
  }

  return isValidHttpUrl(raw);
}

/** @deprecated Use isValidAffiliateLink */
export const isValidAffiliateUrl = isValidAffiliateLink;

export function getAffiliateLinkPlaceholder(platform = 'amazon'): string {
  return platform === 'amazon'
    ? 'Enter ASIN (B0...) or Amazon URL (https://www.amazon.com/dp/...)'
    : 'Enter your affiliate link (https://...)';
}

export function getAffiliateLinkFieldError(link: string, platform = 'amazon'): string | null {
  const raw = (link || '').trim();
  if (!raw) {
    return null;
  }
  if (isValidAffiliateLink(raw, platform)) {
    return null;
  }

  if (platform === 'amazon') {
    const looksLikeUrl = /^https?:\/\//i.test(raw) || raw.includes('/') || raw.includes('.');

    if (!looksLikeUrl) {
      if (raw.length !== 10) {
        return 'Invalid ASIN: enter exactly 10 letters and numbers (e.g. B0D1XD1ZV3).';
      }
      return 'Invalid ASIN: enter a valid Amazon product ASIN.';
    }

    if (!/^https?:\/\//i.test(raw)) {
      return 'Invalid URL: Amazon links must start with https://';
    }

    return 'Invalid URL: use a valid Amazon product link (https://www.amazon.com/dp/ASIN).';
  }

  if (!/^https?:\/\//i.test(raw)) {
    return 'Invalid URL: affiliate links must start with https://';
  }

  return 'Invalid URL: enter a valid affiliate link with a real domain.';
}

/**
 * Message for the first invalid affiliate link, or null if all non-empty links are valid.
 */
export function getAffiliateLinkValidationMessage(
  links: string[],
  platform = 'amazon'
): string | null {
  const nonEmpty = links.map((link) => (link || '').trim()).filter(Boolean);
  for (const link of nonEmpty) {
    const fieldError = getAffiliateLinkFieldError(link, platform);
    if (fieldError) {
      return fieldError;
    }
  }
  return null;
}

export function hasAffiliateLinkValidationError(
  links: string[],
  platform = 'amazon'
): boolean {
  return getAffiliateLinkValidationMessage(links, platform) !== null;
}

export function isAffiliateCommerceBlocked(data: {
  affiliateLinks: string[];
  affiliatePlatform: string;
  affiliateId: string;
}): boolean {
  if (hasAffiliateLinkValidationError(data.affiliateLinks, data.affiliatePlatform)) {
    return true;
  }

  const hasAffiliateLinks = data.affiliateLinks.some((link) => (link || '').trim() !== '');
  return (
    hasAffiliateLinks &&
    data.affiliatePlatform === 'amazon' &&
    !data.affiliateId.trim()
  );
}
