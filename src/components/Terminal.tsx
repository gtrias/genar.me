import { onMount, createSignal } from 'solid-js';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { CanvasAddon } from '@xterm/addon-canvas';
import { WebLinksAddon } from '@xterm/addon-web-links';
import CRTScene from './CRTScene';
import Shell from '../utils/shell';

const TerminalComponent = () => {
  let terminalContainer: HTMLDivElement | undefined;
  let terminal: Terminal | undefined;
  let fitAddon: FitAddon | undefined;
  const [terminalReady, setTerminalReady] = createSignal<Terminal | undefined>(undefined);
  const shell = new Shell();
  let currentLine = '';
  let cursorPosition = 0;

  onMount(() => {
    if (!terminalContainer) return;

    // Initialize terminal
    terminal = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#aeafad',
        selection: '#3e3e3e',
      },
      fontSize: 18,
      fontFamily: 'Consolas, "Courier New", monospace',
      allowTransparency: false,
      convertEol: true,
      scrollback: 1000,
    });

    // Initialize fit addon
    fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    // Initialize canvas addon for canvas rendering
    const canvasAddon = new CanvasAddon();
    terminal.loadAddon(canvasAddon);

    // Set up link handler for OSC 8 escape sequences (official xterm.js way)
    const linkHandler = {
      activate: (event: MouseEvent, uri: string) => {
        // Open link in new tab with security attributes
        window.open(uri, '_blank', 'noopener,noreferrer');
      },
      hover: (event: MouseEvent, uri: string) => {
        // Optional: show URL on hover
      },
      leave: (event: MouseEvent, uri: string) => {
        // Optional: hide URL on leave
      },
      allowNonHttpProtocols: true
    };
    terminal.options.linkHandler = linkHandler;

    // Initialize web links addon for pattern matching (detects URLs in output)
    const webLinksAddon = new WebLinksAddon(
      (event: MouseEvent, uri: string) => {
        window.open(uri, '_blank', 'noopener,noreferrer');
      },
      linkHandler
    );
    terminal.loadAddon(webLinksAddon);

    // Open terminal in container
    terminal.open(terminalContainer);

    // Fit terminal to container
    fitAddon.fit();

    // Wait a moment for terminal to be fully rendered, then display banner
    setTimeout(() => {
      if (!terminal) return;
      
      // Ensure terminal is still fitted
      fitAddon?.fit();
      
      // Display banner
      terminal.write(shell.getBanner());

      // Show initial prompt
      terminal.write(shell.getPrompt());
    }, 100);

    // Handle input
    terminal.onData((data) => {
      const code = data.charCodeAt(0);

      // Handle special keys
      if (code === 13) {
        // Enter key
        terminal.write('\r\n');
        if (currentLine.trim()) {
          const result = shell.executeCommand(currentLine);
          if (result.output) {
            // Handle clear command specially
            if (currentLine.trim() === 'clear') {
              terminal.clear();
            } else {
              terminal.write(result.output);
            }
          }
        }
        currentLine = '';
        cursorPosition = 0;
        terminal.write(shell.getPrompt());
      } else if (code === 127 || code === 8) {
        // Backspace
        if (cursorPosition > 0) {
          currentLine = currentLine.slice(0, cursorPosition - 1) + currentLine.slice(cursorPosition);
          cursorPosition--;
          // Move cursor back, erase character, and redraw rest of line if needed
          terminal.write('\b');
          if (cursorPosition < currentLine.length) {
            const restOfLine = currentLine.slice(cursorPosition);
            terminal.write(restOfLine + ' ');
            // Move cursor back to correct position
            terminal.write('\x1b[' + (restOfLine.length + 1) + 'D');
          } else {
            terminal.write(' ');
            terminal.write('\b');
          }
        }
      } else if (code === 27) {
        // Escape sequence (arrow keys, etc.)
        if (data.length > 1) {
          const sequence = data.slice(1);
          if (sequence === '[A') {
            // Up arrow - history
            const historyCmd = shell.getHistory('up');
            if (historyCmd !== null) {
              // Clear current line
              const prompt = shell.getPrompt();
              terminal.write('\r');
              terminal.write(' '.repeat(prompt.length + currentLine.length));
              terminal.write('\r');
              currentLine = historyCmd;
              cursorPosition = currentLine.length;
              terminal.write(prompt);
              terminal.write(currentLine);
            }
          } else if (sequence === '[B') {
            // Down arrow - history
            const historyCmd = shell.getHistory('down');
            if (historyCmd !== null) {
              // Clear current line
              const prompt = shell.getPrompt();
              terminal.write('\r');
              terminal.write(' '.repeat(prompt.length + currentLine.length));
              terminal.write('\r');
              currentLine = historyCmd;
              cursorPosition = currentLine.length;
              terminal.write(prompt);
              terminal.write(currentLine);
            }
          } else if (sequence === '[C') {
            // Right arrow
            if (cursorPosition < currentLine.length) {
              cursorPosition++;
              terminal.write(data);
            }
          } else if (sequence === '[D') {
            // Left arrow
            if (cursorPosition > 0) {
              cursorPosition--;
              terminal.write(data);
            }
          }
        }
      } else if (code >= 32 && code <= 126) {
        // Printable characters
        if (cursorPosition < currentLine.length) {
          // Insert in middle of line
          currentLine = currentLine.slice(0, cursorPosition) + data + currentLine.slice(cursorPosition);
          cursorPosition++;
          // Redraw the rest of the line
          const restOfLine = currentLine.slice(cursorPosition);
          terminal.write(data);
          terminal.write(restOfLine);
          // Move cursor back to correct position
          if (restOfLine.length > 0) {
            terminal.write('\x1b[' + restOfLine.length + 'D');
          }
        } else {
          // Append to end of line
          currentLine += data;
          cursorPosition++;
          terminal.write(data);
        }
      }
    });

    // Mark terminal as ready for CRT scene
    setTerminalReady(terminal);

    // Handle window resize
    const handleResize = () => {
      fitAddon?.fit();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      terminal?.dispose();
    };
  });

  return (
    <div class="w-full h-full relative" style={{ 'min-height': '400px' }}>
      {/* SVG clip-path definition for curvature */}
      <svg height="0" width="0" viewBox="0 0 93.88 76.19" class="clip-path-defs" aria-hidden="true">
        <title>CRT screen curvature clip path</title>
        <clipPath id="crtPath" clipPathUnits="objectBoundingBox" transform="scale(0.01065 0.01312)">
          <path d="M47.78.5c11.65,0,38,.92,41.81,4,3.59,3,3.79,22.28,3.79,34.19,0,11.67-.08,27.79-3.53,31.24S60.3,75.69,47.78,75.69c-11.2,0-39.89-1.16-44-5.27S.57,52.42.57,38.73.31,8.56,4,4.88,34.77.5,47.78.5Z" />
        </clipPath>
      </svg>
      {/* Bezel wrapper - CSS-styled bezel frame */}
      <div class="crt-bezel w-full h-full relative">
        {/* Inner screen area - fills the space inside the bezel padding */}
        <div class="crt-screen w-full h-full relative">
          {/* Screen background - sits behind all content */}
          <div 
            class="absolute inset-0"
            style={{
              'z-index': 0,
              background: '#1e1e1e',
              backgroundImage: 
                'radial-gradient(circle at 20% 30%, rgba(30, 30, 30, 0.8) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(25, 25, 25, 0.6) 0%, transparent 50%)'
            }}
          />
          {/* Terminal container - very low opacity so canvas renders but is nearly invisible */}
          <div
            ref={terminalContainer}
            class="absolute overflow-hidden"
            style={{ 
              opacity: 0.01,
              'pointer-events': 'auto',
              'z-index': 1,
              top: '25px',
              left: '25px',
              right: '25px',
              bottom: '25px',
              width: 'calc(100% - 50px)',
              height: 'calc(100% - 50px)'
            }}
          />
          {/* CRT Scene overlay - renders the curved terminal */}
          {(() => {
            const term = terminalReady();
            return term ? (
              <CRTScene 
                terminal={term} 
                curvature={0.15}
                scanlineOpacity={0.15}
                vignetteStrength={0.3}
              />
            ) : null;
          })()}
          {/* Curved screen effect overlay - creates convex CRT glass appearance */}
          <div class="crt-curve" />
        </div>
      </div>
    </div>
  );
};

export default TerminalComponent;

