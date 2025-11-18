/**
 * Progress Bar Component
 * Display progress with visual bar
 */

import { colors } from './colors';

export interface ProgressOptions {
  current: number;
  total: number;
  width?: number;
  filledChar?: string;
  emptyChar?: string;
  showPercentage?: boolean;
  color?: 'cyan' | 'pink' | 'purple' | 'green' | 'yellow';
}

/**
 * Create a progress bar
 */
export function progress(options: ProgressOptions): string {
  const {
    current,
    total,
    width = 40,
    filledChar = '█',
    emptyChar = '░',
    showPercentage = true,
    color = 'cyan'
  } = options;

  if (total === 0) {
    return `[${emptyChar.repeat(width)}] 0%`;
  }

  const percent = Math.min(100, Math.max(0, Math.floor((current / total) * 100)));
  const filled = Math.floor((current / total) * width);
  const empty = width - filled;

  const filledBar = filledChar.repeat(filled);
  const emptyBar = emptyChar.repeat(empty);

  const colorFn = colors[color] || colors.cyan;
  const bar = `[${colorFn(filledBar)}${emptyBar}]`;

  if (showPercentage) {
    return `${bar} ${percent}%`;
  }

  return bar;
}

