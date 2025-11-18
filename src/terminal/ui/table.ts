/**
 * Table Rendering Utilities
 * Format data in tables with headers and borders
 */

import { colors } from './colors';
import { ansiLength } from './colors';

export interface TableOptions {
  headers: string[];
  rows: string[][];
  columnWidths?: number[];
  headerColor?: 'cyan' | 'pink' | 'purple' | 'green' | 'yellow' | 'white';
  borderColor?: 'cyan' | 'pink' | 'purple' | 'green' | 'yellow' | 'white' | 'default';
  showBorders?: boolean;
  align?: 'left' | 'center' | 'right';
}

/**
 * Render a table
 */
export function table(options: TableOptions): string {
  const {
    headers,
    rows,
    columnWidths,
    headerColor = 'cyan',
    borderColor = 'default',
    showBorders = true,
    align = 'left'
  } = options;

  if (headers.length === 0) {
    return '';
  }

  // Calculate column widths
  const widths: number[] = columnWidths || [];
  if (widths.length === 0) {
    for (let i = 0; i < headers.length; i++) {
      let maxWidth = ansiLength(headers[i]);
      for (const row of rows) {
        if (row[i]) {
          maxWidth = Math.max(maxWidth, ansiLength(row[i]));
        }
      }
      widths.push(maxWidth + 2); // Add padding
    }
  }

  const colorFn = colors[headerColor] || colors.cyan;
  const borderColorFn = borderColor === 'default' 
    ? (s: string) => s 
    : colors[borderColor] || colors.cyan;

  const result: string[] = [];

  // Top border
  if (showBorders) {
    const topBorder = '┌' + widths.map(w => '─'.repeat(w)).join('┬') + '┐';
    result.push(borderColorFn(topBorder));
  }

  // Headers
  const headerCells: string[] = [];
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const width = widths[i];
    const headerLength = ansiLength(header);
    const padding = width - headerLength;
    
    let paddedHeader = header;
    if (align === 'center') {
      const left = Math.floor(padding / 2);
      const right = padding - left;
      paddedHeader = ' '.repeat(left) + header + ' '.repeat(right);
    } else if (align === 'right') {
      paddedHeader = ' '.repeat(padding) + header;
    } else {
      paddedHeader = header + ' '.repeat(padding);
    }

    headerCells.push(paddedHeader);
  }

  const headerRow = '│' + headerCells.map(cell => ` ${cell} `).join('│') + '│';
  result.push(borderColorFn(headerRow));

  // Header separator
  if (showBorders) {
    const separator = '├' + widths.map(w => '─'.repeat(w)).join('┼') + '┤';
    result.push(borderColorFn(separator));
  }

  // Rows
  for (const row of rows) {
    const cells: string[] = [];
    for (let i = 0; i < headers.length; i++) {
      const cell = row[i] || '';
      const width = widths[i];
      const cellLength = ansiLength(cell);
      const padding = width - cellLength;
      
      let paddedCell = cell;
      if (align === 'center') {
        const left = Math.floor(padding / 2);
        const right = padding - left;
        paddedCell = ' '.repeat(left) + cell + ' '.repeat(right);
      } else if (align === 'right') {
        paddedCell = ' '.repeat(padding) + cell;
      } else {
        paddedCell = cell + ' '.repeat(padding);
      }

      cells.push(paddedCell);
    }

    const rowStr = '│' + cells.map(cell => ` ${cell} `).join('│') + '│';
    result.push(rowStr);
  }

  // Bottom border
  if (showBorders) {
    const bottomBorder = '└' + widths.map(w => '─'.repeat(w)).join('┴') + '┘';
    result.push(borderColorFn(bottomBorder));
  }

  return result.join('\n');
}

