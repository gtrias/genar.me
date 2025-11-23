import type { Command } from './types';

const sshCommand: Command = {
  metadata: {
    name: 'ssh',
    description: 'Connect to SSH server via WebSocket',
    usage: 'ssh [url]',
  },

  async execute(args) {
    // Default production WebSocket URL (to be set manually)
    const DEFAULT_WS_URL = 'ws://localhost:8080/ws';

    // Parse URL from arguments or use default
    const url = args.length > 0 ? args[0] : DEFAULT_WS_URL;

    // Validate URL format
    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      return {
        output: `ssh: Invalid WebSocket URL. Must start with ws:// or wss://\n`,
        exitCode: 1,
      };
    }

    return {
      output: `Connecting to ${url}...\n`,
      exitCode: 0,
      websocketUrl: url,
    };
  },
};

export default sshCommand;
