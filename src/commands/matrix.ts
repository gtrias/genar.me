import type { Command } from './types';

const matrixCommand: Command = {
  metadata: {
    name: 'matrix',
    description: 'Enter the Matrix (press any key to exit)',
    usage: 'matrix',
  },

  async execute(args, { terminal }) {
    if (!terminal) {
      return {
        output: 'Matrix effect requires terminal access\n',
        exitCode: 1,
      };
    }

    // Matrix characters (mix of katakana, ASCII, and numbers)
    const chars = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const cols = terminal.cols;
    const rows = terminal.rows;

    // Track drop positions for each column
    const drops: number[] = new Array(cols).fill(0);

    // Initialize drops at random positions
    for (let i = 0; i < cols; i++) {
      drops[i] = Math.floor(Math.random() * rows);
    }

    let isRunning = true;
    let frameCount = 0;

    // Set up key listener to exit
    const disposable = terminal.onData(() => {
      isRunning = false;
    });

    // Clear screen and hide cursor
    terminal.write('\x1b[2J\x1b[H\x1b[?25l');

    // Animation loop
    const animate = () => {
      if (!isRunning) {
        // Show cursor and clear screen
        terminal.write('\x1b[?25h\x1b[2J\x1b[H');
        disposable.dispose();
        return;
      }

      frameCount++;

      // Draw the matrix rain
      for (let i = 0; i < cols; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];
        const y = drops[i];

        // Only draw if within bounds
        if (y >= 0 && y < rows) {
          // Move cursor to position
          terminal.write(`\x1b[${y + 1};${i + 1}H`);

          // Bright green for the head of the drop
          if (frameCount % 2 === 0) {
            terminal.write('\x1b[1;32m' + char);
          } else {
            // Darker green for trail
            terminal.write('\x1b[32m' + char);
          }
        }

        // Randomly reset drop to top
        if (drops[i] > rows && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop down
        drops[i]++;
      }

      // Reset text color
      terminal.write('\x1b[0m');

      // Continue animation
      setTimeout(animate, 50); // ~20 fps
    };

    // Start animation
    animate();

    return {
      output: '', // Output is handled via direct terminal writes
      exitCode: 0,
    };
  },
};

export default matrixCommand;
