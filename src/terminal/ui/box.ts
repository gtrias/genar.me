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
 * Wrap a line to fit within a maximum width, preserving ANSI codes
 */
function wrapLine(line: string, maxWidth: number): string[] {
  const result: string[] = [];
  const lineLength = ansiLength(line);
  
  if (lineLength <= maxWidth) {
    return [line];
  }
  
  // Simple word-wrap: try to break at spaces
  let remaining = line;
  while (ansiLength(remaining) > maxWidth) {
    // Find the last space within maxWidth
    let breakPoint = maxWidth;
    let foundSpace = false;
    
    // Look for spaces in the visible portion (accounting for ANSI codes)
    let visibleChars = 0;
    let lastSpaceIndex = -1;
    let inAnsiCode = false;
    
    for (let i = 0; i < remaining.length && visibleChars < maxWidth; i++) {
      if (remaining[i] === '\x1b' && remaining[i + 1] === '[') {
        inAnsiCode = true;
        continue;
      }
      if (inAnsiCode) {
        if (remaining[i] === 'm') {
          inAnsiCode = false;
        }
        continue;
      }
      
      if (remaining[i] === ' ') {
        lastSpaceIndex = i;
      }
      visibleChars++;
    }
    
    if (lastSpaceIndex > maxWidth * 0.5) {
      breakPoint = lastSpaceIndex;
      foundSpace = true;
    }
    
    const chunk = remaining.slice(0, breakPoint);
    result.push(chunk);
    
    if (foundSpace) {
      remaining = remaining.slice(breakPoint + 1);
    } else {
      remaining = remaining.slice(breakPoint);
    }
  }
  
  if (remaining.length > 0) {
    result.push(remaining);
  }
  
  return result;
}

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

  // Maximum terminal width (accounting for borders and padding)
  const TERMINAL_WIDTH = 80;
  // Box structure: border(1) + padding + content + padding + border(1)
  // So: contentWidth = TERMINAL_WIDTH - 2*border - 2*padding
  const maxContentWidth = width || (TERMINAL_WIDTH - (padding * 2) - 2); // -2 for borders

  // Split content into lines and wrap long lines
  const rawLines = content.split('\n');
  const wrappedLines: string[] = [];
  
  for (const line of rawLines) {
    if (line.length === 0) {
      wrappedLines.push('');
      continue;
    }
    
    const wrapped = wrapLine(line, maxContentWidth);
    wrappedLines.push(...wrapped);
  }
  
  const lines = wrappedLines;
  
  // Calculate actual width needed
  const contentWidth = width || Math.min(
    maxContentWidth,
    Math.max(
      ...lines.map(line => ansiLength(line)),
      title ? ansiLength(title) + 4 : 0
    )
  );

  // Box width = left border(1) + padding + content + padding + right border(1)
  // Ensure box width never exceeds terminal width
  const boxWidth = Math.min(TERMINAL_WIDTH, contentWidth + (padding * 2) + 2);
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
  // The content area width is contentWidth (not including borders or padding)
  for (const line of lines) {
    const lineLength = ansiLength(line);
    const remaining = contentWidth - lineLength;
    
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

