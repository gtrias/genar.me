import type { Command, CommandContext } from './types';

export const catCommand: Command = {
  name: 'cat',
  description: 'Read and display file contents',
  usage: 'cat <file>',
  category: 'system',

  execute: ({ terminal, args, getFileSystem }: CommandContext) => {
    if (args.length === 0) {
      terminal.writeln('\x1b[91mcat: missing file operand\x1b[0m');
      terminal.writeln('\x1b[90mUsage: cat <file>\x1b[0m');
      return;
    }

    // Get the virtual file system from command context
    const fs = getFileSystem?.();
    if (!fs) {
      terminal.writeln('\x1b[91mcat: file system not available\x1b[0m');
      return;
    }

    const filePath = fs.resolvePath(args[0]);
    const content = fs.readFile(filePath);

    if (content === null) {
      terminal.writeln(`\x1b[91mcat: ${args[0]}: No such file or directory\x1b[0m`);
      return;
    }

    // Display file content with proper line wrapping
    const terminalWidth = 80; // Match the width used in ls command
    
    // Split content by newlines and process each line
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Replace tabs with spaces (assuming 4 spaces per tab)
      const expandedLine = line.replace(/\t/g, '    ');
      
      if (expandedLine.length <= terminalWidth) {
        // Line fits, output as-is
        terminal.writeln(expandedLine);
      } else {
        // Line is too long, wrap it
        const wrappedLines = wrapLine(expandedLine, terminalWidth);
        for (const wrappedLine of wrappedLines) {
          terminal.writeln(wrappedLine);
        }
      }
    }
  }
};

/**
 * Wrap a long line to fit within terminal width
 * Attempts to break at word boundaries when possible
 */
function wrapLine(line: string, width: number): string[] {
  const result: string[] = [];
  
  // Detect leading whitespace (indentation)
  const leadingWhitespaceMatch = line.match(/^(\s*)/);
  const leadingWhitespace = leadingWhitespaceMatch ? leadingWhitespaceMatch[1] : '';
  const indentWidth = leadingWhitespace.length;
  const content = line.slice(indentWidth);
  
  // Calculate available width for content (accounting for indentation)
  const availableWidth = width;
  
  let remaining = content;
  let isFirstLine = true;
  
  while (remaining.length > 0) {
    const currentIndent = isFirstLine ? leadingWhitespace : '';
    const currentAvailableWidth = availableWidth - currentIndent.length;
    
    if (remaining.length <= currentAvailableWidth) {
      // Remaining content fits
      result.push(currentIndent + remaining);
      break;
    }
    
    // Try to find a word boundary to break at
    let breakPoint = currentAvailableWidth;
    const spaceIndex = remaining.lastIndexOf(' ', currentAvailableWidth);
    
    if (spaceIndex > currentAvailableWidth * 0.5) {
      // Found a space in the second half, break there
      breakPoint = spaceIndex;
    }
    
    // Extract the chunk
    const chunk = remaining.slice(0, breakPoint);
    result.push(currentIndent + chunk);
    
    // Remove the chunk and any leading space
    remaining = remaining.slice(breakPoint).trimStart();
    isFirstLine = false;
  }
  
  return result;
}
