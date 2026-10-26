import { onMount, onCleanup, createSignal, For } from 'solid-js';
import { Terminal } from '@xterm/xterm';
import { CanvasAddon } from '@xterm/addon-canvas';
import { WebLinksAddon } from '@xterm/addon-web-links';
import CRTFrame from './CRTFrame';
import CRTScene from './CRTScene';
import ProjectsScreen from './ProjectsScreen';
import Shell from '../utils/shell';
import { KEYPAD_EVENT } from '../config/keypad';
import { PHOSPHOR } from '../config/phosphor';
import { XTERM_INSET, XTERM_SCROLLBAR } from '../config/screen';
import { identity } from '../brand/identity.js';

const MONO_FONT = '"JetBrains Mono"';
// JetBrains Mono advance width, in em
const GLYPH_WIDTH = 0.6;
// Slots in the front vent grille, as on the mock
const VENT_SLOTS = Array.from({ length: 11 });
// The text area is this many columns wide: the banner's longest line fills it, as on the mock
const BANNER_COLUMNS = Math.max(...identity.intro.map((line) => line.length));
// Narrowest cell, in CSS px; narrower text areas get fewer columns and wrap the banner
const MIN_CELL = 5.5;
// Row pitch over cell width, measured on the mock (31.75px rows, 13.9px cells)
const PITCH_RATIO = 2.284;

/**
 * Grid for a text area, and the font size whose whole-pixel cell comes closest to it. The CRT view
 * stretches the terminal canvas over the text area, so columns and rows land where the mock has them
 * whatever xterm rounds its cells to.
 */
const gridFor = (width: number, height: number) => {
  const cols = Math.max(1, Math.min(BANNER_COLUMNS, Math.floor(width / MIN_CELL)));
  const cell = width / cols;
  const rows = Math.max(1, Math.round(height / (cell * PITCH_RATIO)));
  // xterm floors the glyph advance to device pixels: aim at the middle of the nearest whole one
  const dpr = window.devicePixelRatio;
  const deviceCell = Math.max(1, Math.round(cell * dpr));
  return { cols, rows, fontSize: (deviceCell + 0.5) / dpr / GLYPH_WIDTH };
};

const TerminalComponent = () => {
  let terminalContainer: HTMLDivElement | undefined;
  let terminal: Terminal | undefined;
  let bezelEl: HTMLDivElement | undefined;
  let screenEl: HTMLDivElement | undefined;
  const [terminalReady, setTerminalReady] = createSignal<Terminal | undefined>(undefined);
  const [isPaused, setIsPaused] = createSignal(false);
  const shell = new Shell();
  let currentLine = '';
  let cursorPosition = 0;

  const insertText = (text: string) => {
    const restOfLine = currentLine.slice(cursorPosition);
    currentLine = currentLine.slice(0, cursorPosition) + text + restOfLine;
    cursorPosition += text.length;
    terminal?.write(text + restOfLine);
    if (restOfLine.length > 0) terminal?.write('\x1b[' + restOfLine.length + 'D');
  };

  const complete = async () => {
    const before = currentLine.slice(0, cursorPosition);
    const matches = await shell.getCompletions(before);
    // The line may have changed while suggestions were computed
    if (isPaused() || currentLine.slice(0, cursorPosition) !== before || matches.length === 0) return;

    const word = before.match(/\S*$/)![0];
    let completion = matches.reduce((prefix, match) => {
      let i = 0;
      while (i < prefix.length && prefix[i] === match[i]) i++;
      return prefix.slice(0, i);
    });
    if (matches.length === 1 && !completion.endsWith('/')) completion += ' ';

    if (completion.length > word.length) {
      insertText(completion.slice(word.length));
      return;
    }
    if (matches.length === 1) return;

    // The word can't grow: list the candidates by their last path segment, then redraw the line
    const dirLength = word.lastIndexOf('/') + 1;
    const restOfLine = currentLine.slice(cursorPosition);
    terminal?.write('\r\n' + matches.map((match) => match.slice(dirLength)).join('  ') + '\r\n');
    terminal?.write(shell.getPrompt() + currentLine);
    if (restOfLine.length > 0) terminal?.write('\x1b[' + restOfLine.length + 'D');
  };

  // xterm measures glyphs once, when it opens: start it only after the webfont is ready
  const start = () => {
    if (!terminalContainer) return;

    // The container is a scrollbar wider than the text area the CRT view shows
    const grid = () => gridFor(terminalContainer!.clientWidth - XTERM_SCROLLBAR, terminalContainer!.clientHeight);
    const fitGrid = () => {
      if (!terminal) return;
      const { cols, rows, fontSize } = grid();
      if (terminal.options.fontSize !== fontSize) terminal.options.fontSize = fontSize;
      if (terminal.cols !== cols || terminal.rows !== rows) terminal.resize(cols, rows);
    };
    const initial = grid();

    // Initialize terminal
    terminal = new Terminal({
      cursorBlink: true,
      theme: {
        background: PHOSPHOR.background,
        foreground: PHOSPHOR.foreground,
        cursor: PHOSPHOR.cursor,
        brightBlack: PHOSPHOR.dim,
      },
      fontSize: initial.fontSize,
      cols: initial.cols,
      rows: initial.rows,
      fontFamily: `${MONO_FONT}, Consolas, "Courier New", monospace`,
      // Light: the mock's phosphor strokes are thin, with the glow doing the rest
      fontWeight: 300,
      allowTransparency: false,
      convertEol: true,
      scrollback: 1000,
      disableStdin: false, // Ensure input is enabled
    });

    // Set up link handler for OSC 8 escape sequences (official xterm.js way)
    const linkHandler = {
      activate: (_event: MouseEvent, uri: string) => {
        // Open link in new tab with security attributes
        window.open(uri, '_blank', 'noopener,noreferrer');
      },
      hover: (_event: MouseEvent, _uri: string) => {
        // Optional: show URL on hover
      },
      leave: (_event: MouseEvent, _uri: string) => {
        // Optional: hide URL on leave
      },
      allowNonHttpProtocols: true
    };
    terminal.options.linkHandler = linkHandler;

    // Initialize web links addon for pattern matching (detects URLs in output)
    const webLinksAddon = new WebLinksAddon(
      (_event: MouseEvent, uri: string) => {
        window.open(uri, '_blank', 'noopener,noreferrer');
      },
      linkHandler
    );
    terminal.loadAddon(webLinksAddon);

    // Open terminal in container
    terminal.open(terminalContainer);

    // Renderer addon, loaded after open() as in its README
    terminal.loadAddon(new CanvasAddon());

    // Wait a moment for terminal to be fully rendered, then display banner
    setTimeout(() => {
      if (!terminal) return;
      
      // Display banner
      terminal.write(shell.getBanner());

      // Show initial prompt
      terminal.write(shell.getPrompt());
    }, 100);

    // Input handler: a local line editor in front of the shell
    const registerInputHandler = () => {
      if (!terminal) return;
      terminal.onData((data) => {
        // Ignore input if paused
        if (isPaused()) {
          return;
        }

        const code = data.charCodeAt(0);

        // Handle special keys
        if (data === '\t') {
          void complete();
        } else if (code === 13) {
          // Enter key
          terminal?.write('\r\n');
        if (currentLine.trim()) {
          // Execute command asynchronously
          shell.executeCommand(currentLine, terminal).then((result) => {
            if (result.output) {
              terminal?.write(result.output);
            }
            currentLine = '';
            cursorPosition = 0;
            terminal?.write(shell.getPrompt());
          }).catch((error) => {
            terminal?.write(`Error: ${error}\r\n`);
            currentLine = '';
            cursorPosition = 0;
            terminal?.write(shell.getPrompt());
          });
          return;
          }
          currentLine = '';
          cursorPosition = 0;
          terminal?.write(shell.getPrompt());
        } else if (code === 127 || code === 8) {
          // Backspace
          if (cursorPosition > 0) {
            currentLine = currentLine.slice(0, cursorPosition - 1) + currentLine.slice(cursorPosition);
            cursorPosition--;
            // Move cursor back, erase character, and redraw rest of line if needed
            terminal?.write('\b');
            if (cursorPosition < currentLine.length) {
              const restOfLine = currentLine.slice(cursorPosition);
              terminal?.write(restOfLine + ' ');
              // Move cursor back to correct position
              terminal?.write('\x1b[' + (restOfLine.length + 1) + 'D');
            } else {
              terminal?.write(' ');
              terminal?.write('\b');
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
                terminal?.write('\r');
                terminal?.write(' '.repeat(prompt.length + currentLine.length));
                terminal?.write('\r');
                currentLine = historyCmd;
                cursorPosition = currentLine.length;
                terminal?.write(prompt);
                terminal?.write(currentLine);
              }
            } else if (sequence === '[B') {
              // Down arrow - history
              const historyCmd = shell.getHistory('down');
              if (historyCmd !== null) {
                // Clear current line
                const prompt = shell.getPrompt();
                terminal?.write('\r');
                terminal?.write(' '.repeat(prompt.length + currentLine.length));
                terminal?.write('\r');
                currentLine = historyCmd;
                cursorPosition = currentLine.length;
                terminal?.write(prompt);
                terminal?.write(currentLine);
              }
            } else if (sequence === '[C') {
              // Right arrow
              if (cursorPosition < currentLine.length) {
                cursorPosition++;
                terminal?.write(data);
              }
            } else if (sequence === '[D') {
              // Left arrow
              if (cursorPosition > 0) {
                cursorPosition--;
                terminal?.write(data);
              }
            }
          }
        } else if (code >= 32 && code <= 126) {
          // Printable characters
          insertText(data);
        }
      });
    };

    registerInputHandler();

    // Mark terminal as ready for CRT scene
    setTerminalReady(terminal);

    // The panel keypad types into the terminal like the keyboard does
    onKeypad = (event: Event) => terminal?.input((event as CustomEvent<string>).detail);
    window.addEventListener(KEYPAD_EVENT, onKeypad);

    // Size the grid from the container's real size. The container-unit layout can still settle after
    // start() runs, and window resizes are not the only way it changes, so observe the element.
    resizeObserver = new ResizeObserver(fitGrid);
    resizeObserver.observe(terminalContainer);
  };

  let onKeypad: ((event: Event) => void) | undefined;
  let resizeObserver: ResizeObserver | undefined;

  onMount(() => {
    // Fall back to the system monospace if the webfont fails to load
    void document.fonts.load(`300 16px ${MONO_FONT}`).finally(start);
  });

  // Registered here, not inside start(): start() runs after an await, outside the component's owner
  onCleanup(() => {
    resizeObserver?.disconnect();
    if (onKeypad) window.removeEventListener(KEYPAD_EVENT, onKeypad);
    terminal?.dispose();
  });

  const togglePause = () => {
    const paused = !isPaused();
    setIsPaused(paused);
    
    if (terminal) {
      if (paused) {
        terminal.options.disableStdin = true;
        terminal.write('\r\n\x1b[33m[PAUSED]\x1b[0m\r\n');
      } else {
        terminal.options.disableStdin = false;
        terminal.write('\r\n\x1b[32m[RESUMED]\x1b[0m\r\n');
        terminal.write(shell.getPrompt());
      }
    }
  };

  return (
    <div class="w-full h-full relative" style={{ 'min-height': '400px' }}>
      {/* Housing: the screen sits in its padding, the moulded frame is drawn over it */}
      <div ref={bezelEl} class="crt-bezel w-full h-full relative">
        {/* Front panel, below the screen: vent grille, power button, status lamp */}
        <div class="crt-vent" aria-hidden="true">
          <For each={VENT_SLOTS}>{() => <span />}</For>
        </div>
        <button
          type="button"
          onClick={togglePause}
          class="crt-power"
          classList={{ 'is-off': isPaused() }}
          aria-pressed={isPaused()}
          title={isPaused() ? 'Resume terminal' : 'Pause terminal'}
        />
        <div class="crt-lamp" classList={{ 'is-off': isPaused() }} title={isPaused() ? 'Terminal off' : 'Terminal on'} />
        {/* Inner screen area - fills the space inside the bezel padding */}
        <div ref={screenEl} class="crt-screen w-full h-full relative">
          {/* Screen background - sits behind all content */}
          <div 
            class="absolute inset-0"
          style={{
            'z-index': 0,
            background: PHOSPHOR.background,
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
              ...XTERM_INSET,
            }}
          />
          {/* CRT Scene overlay - renders the curved terminal */}
          {(() => {
            const term = terminalReady();
            return term ? (
              <CRTScene 
                terminal={term} 
                curvature={0.08}
                scanlineOpacity={0.25}
                vignetteStrength={0.18}
              />
            ) : null;
          })()}
          {/* Project list for visitors who don't use the shell, opened from the panel */}
          <ProjectsScreen />
          {/* Curved screen effect overlay - creates convex CRT glass appearance */}
          <div class="crt-curve" />
        </div>
        <CRTFrame bezel={() => bezelEl} screen={() => screenEl} />
      </div>
    </div>
  );
};

export default TerminalComponent;

