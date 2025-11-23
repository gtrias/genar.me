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
    const speeds: number[] = new Array(cols).fill(0);

    // Initialize drops at random positions with random speeds
    for (let i = 0; i < cols; i++) {
      drops[i] = Math.floor(Math.random() * -rows); // Start above screen
      speeds[i] = Math.random() * 0.5 + 0.5; // Speed between 0.5 and 1
    }

    let isRunning = true;

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

      // Dim the entire screen by printing semi-transparent black
      // This creates the fading trail effect
      terminal.write('\x1b[H'); // Move to home
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Randomly clear some characters to create the fading effect
          if (Math.random() > 0.95) {
            terminal.write(`\x1b[${row + 1};${col + 1}H `);
          }
        }
      }

      // Draw the matrix rain
      for (let i = 0; i < cols; i++) {
        const y = Math.floor(drops[i]);

        // Draw the bright head of the drop
        if (y >= 0 && y < rows) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          terminal.write(`\x1b[${y + 1};${i + 1}H\x1b[1;32m${char}`);
        }

        // Draw fading trail (3-5 characters behind)
        const trailLength = 5;
        for (let j = 1; j < trailLength; j++) {
          const trailY = y - j;
          if (trailY >= 0 && trailY < rows) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            // Fade from bright to dark green
            const brightness = Math.max(0, 32 - j * 5);
            terminal.write(`\x1b[${trailY + 1};${i + 1}H\x1b[38;5;${brightness}m${char}`);
          }
        }

        // Move drop down
        drops[i] += speeds[i];

        // Reset drop to top when it goes off screen
        if (drops[i] > rows + 10) {
          drops[i] = Math.random() * -20;
          speeds[i] = Math.random() * 0.5 + 0.5;
        }
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
