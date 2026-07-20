// src/lib/utils/export.ts
import type { KeywordCollectionItem } from '@/lib/hooks/use-keyword-collections';

export interface ExportKeyword {
  keyword: string;
  search_volume?: number;
  competition?: number;
  competition_level?: string;
  cpc?: number;
  keyword_difficulty?: number;
  difficulty_level?: string;
  main_search_intent?: string;
  user_priority?: string;
  user_notes?: string;
  user_tags?: string;
  is_selected?: boolean;
  content_generated?: boolean;
  last_updated?: string;
  created_at?: string;
}

/**
 * Prepare keywords for export by formatting fields
 */
export function prepareKeywordsForExport(keywords: KeywordCollectionItem[]): ExportKeyword[] {
  return keywords.map((kw) => ({
    keyword: kw.keyword,
    search_volume: kw.search_volume,
    competition: kw.competition ? Math.round(kw.competition * 100) : undefined,
    competition_level: kw.competition_level,
    cpc: kw.cpc,
    keyword_difficulty: kw.keyword_difficulty,
    difficulty_level: kw.difficulty_level,
    main_search_intent: kw.main_search_intent,
    user_priority: kw.user_priority,
    user_notes: kw.user_notes,
    user_tags: Array.isArray(kw.user_tags) ? kw.user_tags.join(', ') : '',
    is_selected: kw.is_selected,
    content_generated: kw.content_generated,
    last_updated: kw.last_updated_time,
    created_at: kw.created_at
  }));
}

/**
 * Convert data to CSV string
 */
function convertToCSV(data: ExportKeyword[]): string {
  if (data.length === 0) return '';

  // Define headers
  const headers = [
    'Keyword',
    'Search Volume',
    'Competition %',
    'Competition Level',
    'CPC',
    'Difficulty',
    'Difficulty Level',
    'Search Intent',
    'Priority',
    'Notes',
    'Tags',
    'Selected',
    'Content Generated',
    'Last Updated',
    'Created At'
  ];

  // Create CSV rows
  const rows = data.map((item) => [
    escapeCSVValue(item.keyword),
    item.search_volume ?? '',
    item.competition ?? '',
    item.competition_level ?? '',
    item.cpc ?? '',
    item.keyword_difficulty ?? '',
    item.difficulty_level ?? '',
    item.main_search_intent ?? '',
    item.user_priority ?? '',
    escapeCSVValue(item.user_notes ?? ''),
    escapeCSVValue(item.user_tags ?? ''),
    item.is_selected ? 'Yes' : 'No',
    item.content_generated ? 'Yes' : 'No',
    item.last_updated ?? '',
    item.created_at ?? ''
  ]);

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  return csvContent;
}

/**
 * Escape CSV values that contain commas, quotes, or newlines
 */
function escapeCSVValue(value: string): string {
  if (!value) return '';

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

/**
 * Download a string as a file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export keywords to CSV file
 */
export function exportToCSV(keywords: KeywordCollectionItem[], filename: string): void {
  const preparedData = prepareKeywordsForExport(keywords);
  const csvContent = convertToCSV(preparedData);

  if (!csvContent) {
    throw new Error('No data to export');
  }

  const fullFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadFile(csvContent, fullFilename, 'text/csv;charset=utf-8;');
}

/**
 * Export keywords to Excel file using XLSX library
 * Note: This function requires the 'xlsx' package to be installed
 */
export async function exportToExcel(
  keywords: KeywordCollectionItem[],
  filename: string
): Promise<void> {
  try {
    // Dynamic import to avoid bundling if not used
    let XLSX;
    try {
      XLSX = await import('xlsx');
    } catch {
      throw new Error(
        'Excel export requires the xlsx package. Please install it: npm install xlsx'
      );
    }

    const preparedData = prepareKeywordsForExport(keywords);

    if (preparedData.length === 0) {
      throw new Error('No data to export');
    }

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(preparedData, {
      header: [
        'keyword',
        'search_volume',
        'competition',
        'competition_level',
        'cpc',
        'keyword_difficulty',
        'difficulty_level',
        'main_search_intent',
        'user_priority',
        'user_notes',
        'user_tags',
        'is_selected',
        'content_generated',
        'last_updated',
        'created_at'
      ]
    });

    // Set column headers
    const headers = [
      'Keyword',
      'Search Volume',
      'Competition %',
      'Competition Level',
      'CPC',
      'Difficulty',
      'Difficulty Level',
      'Search Intent',
      'Priority',
      'Notes',
      'Tags',
      'Selected',
      'Content Generated',
      'Last Updated',
      'Created At'
    ];

    headers.forEach((header, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      worksheet[cellAddress].v = header;
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Keywords');

    // Set column widths
    const columnWidths = [
      { wch: 30 }, // Keyword
      { wch: 15 }, // Search Volume
      { wch: 12 }, // Competition %
      { wch: 18 }, // Competition Level
      { wch: 10 }, // CPC
      { wch: 12 }, // Difficulty
      { wch: 18 }, // Difficulty Level
      { wch: 15 }, // Search Intent
      { wch: 12 }, // Priority
      { wch: 40 }, // Notes
      { wch: 25 }, // Tags
      { wch: 10 }, // Selected
      { wch: 18 }, // Content Generated
      { wch: 20 }, // Last Updated
      { wch: 20 } // Created At
    ];
    worksheet['!cols'] = columnWidths;

    // Generate Excel file
    const fullFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    XLSX.writeFile(workbook, fullFilename);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      throw new Error(
        'Excel export requires the xlsx package. Please install it: npm install xlsx'
      );
    }
    throw error;
  }
}

/**
 * Generate a filename for export based on collection title
 */
export function generateExportFilename(collectionTitle: string, format: 'csv' | 'xlsx'): string {
  // Clean the title to make it filename-safe
  const cleanTitle = collectionTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${cleanTitle}-${timestamp}.${format}`;
}
