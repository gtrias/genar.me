/**
 * Box Drawing Utilities
 * Charm-inspired box drawing with various border styles
 */

import { colors } from './colors';
import { ansiLength } from './colors';

export type BorderStyle = 'single' | 'double' | 'rounded' | 'bold';

export interface BoxOptions {
  title?: string;
  borderColor?: 'cyan' | 'pink' | 'purple' | 'green' | 'yellow' | 'white' | 'default';
  borderStyle?: BorderStyle;
  padding?: number;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

const borders = {
  rounded: { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
  single:  { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  double:  { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
  bold:    { tl: '┏', tr: '┓', bl: '┗', br: '┛', h: '━', v: '┃' },
};

/**
 * Draw a box around content
 */
export function box(content: string, options: BoxOptions = {}): string {
  const {
    title,
    borderColor = 'cyan',
    borderStyle = 'rounded',
    padding = 1,
    width,
    align = 'left'
  } = options;

  const border = borders[borderStyle];
  const colorFn = borderColor === 'default' 
    ? (s: string) => s 
    : colors[borderColor] || colors.cyan;

  // Split content into lines
  const lines = content.split('\n').filter(line => line.length > 0);
  
  // Calculate width
  const contentWidth = width || Math.max(
    ...lines.map(line => ansiLength(line)),
    title ? ansiLength(title) + 4 : 0
  );

  const boxWidth = contentWidth + (padding * 2);
  const horizontal = border.h.repeat(boxWidth);

  // Build box
  const result: string[] = [];

  // Top border
  if (title) {
    const titleLine = ` ${title} `;
    const titleLength = ansiLength(titleLine);
    const remaining = boxWidth - titleLength;
    const left = Math.floor(remaining / 2);
    const right = remaining - left;
    
    result.push(
      colorFn(border.tl + border.h.repeat(left) + titleLine + border.h.repeat(right) + border.tr)
    );
  } else {
    result.push(colorFn(border.tl + horizontal + border.tr));
  }

  // Content lines
  for (const line of lines) {
    const lineLength = ansiLength(line);
    const remaining = boxWidth - lineLength;
    
    let paddedLine = line;
    if (align === 'center') {
      const left = Math.floor(remaining / 2);
      const right = remaining - left;
      paddedLine = ' '.repeat(left) + line + ' '.repeat(right);
    } else if (align === 'right') {
      paddedLine = ' '.repeat(remaining) + line;
    } else {
      paddedLine = line + ' '.repeat(remaining);
    }

    const paddingStr = ' '.repeat(padding);
    result.push(colorFn(border.v) + paddingStr + paddedLine + paddingStr + colorFn(border.v));
  }

  // Bottom border
  result.push(colorFn(border.bl + horizontal + border.br));

  return result.join('\n');
}

/**
 * Create a simple divider line
 */
export function divider(
  char: string = '─',
  length: number = 60,
  color: 'cyan' | 'pink' | 'purple' | 'green' | 'yellow' | 'white' | 'default' = 'default'
): string {
  const line = char.repeat(length);
  const colorFn = color === 'default' ? (s: string) => s : colors[color] || colors.cyan;
  return colorFn(line);
}

