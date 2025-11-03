import type { BootMessage } from '../config/BootConfig';

export const DEFAULT_BOOT_MESSAGES: BootMessage[] = [
  { text: 'BIOS v2.1.7 - Cyber Systems Inc.', color: '\x1b[96m', delay: 0 },
  { text: 'Copyright (c) 2024 Cyber Systems', color: '\x1b[96m', delay: 200 },
  { text: '', color: '', delay: 100 },
  { text: 'CPU: Quantum Processor X9 @ 4.2GHz', color: '\x1b[95m', delay: 300 },
  { text: 'CPU Test: [OK]', color: '\x1b[92m', delay: 800 },
  { text: '', color: '', delay: 200 },
  { text: 'Memory: 32768MB DDR7', color: '\x1b[95m', delay: 300 },
  { text: 'Memory Test: ', color: '\x1b[95m', delay: 600 },
  { text: '████████████████████', color: '\x1b[92m', delay: 900, instant: true },
  { text: '[OK]', color: '\x1b[92m', delay: 100 },
  { text: '', color: '', delay: 200 },
  { text: 'Initializing System Modules...', color: '\x1b[94m', delay: 300 },
  { text: 'Loading kernel.sys', color: '\x1b[96m', delay: 600 },
  { text: 'Loading drivers.dll', color: '\x1b[96m', delay: 900 },
  { text: 'Loading network.stack', color: '\x1b[96m', delay: 1200 },
  { text: 'Loading security.module', color: '\x1b[96m', delay: 1500 },
  { text: 'System Modules: [OK]', color: '\x1b[92m', delay: 1800 },
  { text: '', color: '', delay: 200 },
  { text: 'Checking Hardware...', color: '\x1b[94m', delay: 300 },
  { text: 'HDD0: CyberDrive SSD 2TB [OK]', color: '\x1b[92m', delay: 600 },
  { text: 'GPU: NeonGraphics RTX 9090 [OK]', color: '\x1b[92m', delay: 900 },
  { text: 'NET: CyberLink 10GbE [OK]', color: '\x1b[92m', delay: 1200 },
  { text: '', color: '', delay: 300 },
  { text: 'System Check Complete', color: '\x1b[92m', delay: 400 },
  { text: 'All systems operational', color: '\x1b[96m', delay: 700 },
  { text: '', color: '', delay: 500 },
  { text: 'Starting interactive terminal...', color: '\x1b[92m', delay: 800 },
  { text: '', color: '', delay: 1000 },
];

export const MINIMAL_BOOT_MESSAGES: BootMessage[] = [
  { text: 'System initializing...', color: '\x1b[96m', delay: 0 },
  { text: 'Loading terminal...', color: '\x1b[92m', delay: 500 },
  { text: 'Ready.', color: '\x1b[92m', delay: 1000 },
];

export function getBootMessages(theme?: 'cyberpunk' | 'minimal'): BootMessage[] {
  switch (theme) {
    case 'minimal':
      return MINIMAL_BOOT_MESSAGES;
    case 'cyberpunk':
    default:
      return DEFAULT_BOOT_MESSAGES;
  }
}