import { type ClassValue, clsx } from 'clsx';
import { customAlphabet } from 'nanoid';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function addCommas(number: number) {
  const numStr = number?.toString();
  const lastThree = numStr?.slice(-3);
  let rest = numStr?.slice(0, -3);

  if (rest?.length > 0) {
    rest = rest?.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return rest + ',' + lastThree;
  } else {
    return lastThree;
  }
}
export const generateSkeleton = (w: number, h: number) => {
  const toBase64 = (str: string) => {
    return typeof window === 'undefined' ? Buffer.from(str)?.toString('base64') : window.btoa(str);
  };

  return toBase64(`
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
   <linearGradient id="g">
      <stop stop-color="#e7e8eb" offset="20%" />
      <stop stop-color="#f0f1f4" offset="50%" />
      <stop stop-color="#e7e8eb" offset="70%" />
   </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#e4e7eb" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`);
};

/**
 * Generates page numbers for pagination with ellipsis
 * @param currentPage - Current page number (1-based)
 * @param totalPages - Total number of pages
 * @returns Array of page numbers and ellipsis strings
 *
 * Examples:
 * - Small dataset (≤5 pages): [1, 2, 3, 4, 5]
 * - Near beginning: [1, 2, 3, '...', 10]
 * - In middle: [1, '...', 4, 5, 6, '...', 10]
 * - Near end: [1, '...', 8, 9, 10]
 */
export function getPageNumbers(currentPage: number, totalPages: number) {
  const range = [];

  // Always show first page
  range.push(1);

  // If total pages is 1, just return [1]
  if (totalPages === 1) return range;

  // Calculate the range of pages to show around current page
  let startPage = Math.max(2, currentPage - 1);
  let endPage = Math.min(totalPages - 1, currentPage + 1);

  // Adjust if we're near the start or end
  if (currentPage <= 3) {
    endPage = Math.min(4, totalPages - 1);
  } else if (currentPage >= totalPages - 2) {
    startPage = Math.max(2, totalPages - 3);
  }

  // Add ellipsis after first page if needed
  if (startPage > 2) {
    range.push('...');
  }

  // Add page numbers in the middle
  for (let i = startPage; i <= endPage; i++) {
    range.push(i);
  }

  // Add ellipsis before last page if needed
  if (endPage < totalPages - 1) {
    range.push('...');
  }

  // Always show last page if there is more than one page
  if (totalPages > 1) {
    range.push(totalPages);
  }

  return range;
}

export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {}
) {
  if (!date) return '';

  try {
    return new Intl.DateTimeFormat('en-US', {
      month: opts.month ?? 'long',
      day: opts.day ?? 'numeric',
      year: opts.year ?? 'numeric',
      ...opts
    }).format(new Date(date));
  } catch (err) {
    console.error(err);
    return '';
  }
}

const prefixes: Record<string, unknown> = {};

interface GenerateIdOptions {
  length?: number;
  separator?: string;
}

export function generateId(
  prefixOrOptions?: keyof typeof prefixes | GenerateIdOptions,
  inputOptions: GenerateIdOptions = {}
) {
  const finalOptions = typeof prefixOrOptions === 'object' ? prefixOrOptions : inputOptions;

  const prefix = typeof prefixOrOptions === 'object' ? undefined : prefixOrOptions;

  const { length = 12, separator = '_' } = finalOptions;
  const id = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    length
  )();

  return prefix && prefix in prefixes ? `${prefixes[prefix]}${separator}${id}` : id;
}
