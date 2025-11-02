import type { Command, CommandContext } from './types';

export const lsCommand: Command = {
  name: 'ls',
  description: 'List directory contents',
  usage: 'ls [-la]',
  category: 'system',

  execute: ({ terminal, args }: CommandContext) => {
    const showAll = args.includes('-la') || args.includes('-a') || args.includes('-l');

    if (showAll) {
      // Fake detailed directory listing
      terminal.writeln('');
      terminal.writeln('\x1b[90mtotal 42\x1b[0m');
      terminal.writeln('\x1b[94mdrwxr-xr-x\x1b[0m  12 dev  dev   4096 Jan  3 2025 \x1b[94m.\x1b[0m');
      terminal.writeln('\x1b[94mdrwxr-xr-x\x1b[0m   8 dev  dev   4096 Jan  1 2025 \x1b[94m..\x1b[0m');
      terminal.writeln('\x1b[90m-rw-r--r--\x1b[0m   1 dev  dev    220 Jan  1 2025 .bash_logout');
      terminal.writeln('\x1b[90m-rw-r--r--\x1b[0m   1 dev  dev   3526 Jan  1 2025 .bashrc');
      terminal.writeln('\x1b[94mdrwxr-xr-x\x1b[0m   3 dev  dev   4096 Jan  2 2025 \x1b[94m.config\x1b[0m');
      terminal.writeln('\x1b[90m-rw-r--r--\x1b[0m   1 dev  dev    807 Jan  1 2025 .profile');
      terminal.writeln('\x1b[90m-rw-------\x1b[0m   1 dev  dev   1024 Jan  3 2025 .secret_projects');
      terminal.writeln('\x1b[94mdrwxr-xr-x\x1b[0m   5 dev  dev   4096 Jan  3 2025 \x1b[94mDocuments\x1b[0m');
      terminal.writeln('\x1b[94mdrwxr-xr-x\x1b[0m   8 dev  dev   4096 Jan  2 2025 \x1b[94mProjects\x1b[0m');
      terminal.writeln('\x1b[92m-rwxr-xr-x\x1b[0m   1 dev  dev   8192 Jan  3 2025 \x1b[92mawesome_app\x1b[0m');
      terminal.writeln('\x1b[90m-rw-r--r--\x1b[0m   1 dev  dev  13370 Jan  2 2025 portfolio.json');
      terminal.writeln('\x1b[90m-rw-r--r--\x1b[0m   1 dev  dev   4242 Jan  3 2025 README.md');
      terminal.writeln('\x1b[90m-rw-r--r--\x1b[0m   1 dev  dev    512 Jan  1 2025 resume.pdf');
      terminal.writeln('\x1b[90m-rw-r--r--\x1b[0m   1 dev  dev      0 Jan  3 2025 todo.txt');
      terminal.writeln('\x1b[94mdrwxr-xr-x\x1b[0m   3 dev  dev   4096 Jan  2 2025 \x1b[94mwebsite\x1b[0m');
      terminal.writeln('');
    } else {
      // Simple listing
      terminal.writeln('');
      terminal.writeln('\x1b[94mDocuments\x1b[0m      \x1b[94mProjects\x1b[0m       \x1b[94mwebsite\x1b[0m');
      terminal.writeln('\x1b[92mawesome_app\x1b[0m    portfolio.json README.md');
      terminal.writeln('resume.pdf     todo.txt');
      terminal.writeln('');
    }
  }
};
