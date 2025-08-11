/**
 * Safely escapes a CSV field value
 * Handles quotes, commas, and newlines according to RFC 4180
 */
export function escapeCsvField(field: string): string {
  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Converts a 2D array to CSV string with proper escaping
 */
export function arrayToCsv(data: (string | number | boolean | null | undefined)[][]): string {
  return data
    .map(row => 
      row.map(cell => {
        if (cell === null || cell === undefined) {
          return '';
        }
        return escapeCsvField(String(cell));
      }).join(',')
    )
    .join('\n');
}

/**
 * Adds UTF-8 BOM for Excel compatibility
 */
export function addUtf8Bom(csvContent: string): string {
  const BOM = '\uFEFF';
  return BOM + csvContent;
}

/**
 * Creates a CSV blob with UTF-8 BOM for download
 */
export function createCsvBlob(data: (string | number | boolean | null | undefined)[][]): Blob {
  const csvContent = arrayToCsv(data);
  const csvWithBom = addUtf8Bom(csvContent);
  return new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Downloads CSV file with proper filename
 */
export function downloadCsv(data: (string | number | boolean | null | undefined)[][], filename: string): void {
  const blob = createCsvBlob(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats currency for CSV export
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats date for CSV export
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0]; // YYYY-MM-DD format
}
