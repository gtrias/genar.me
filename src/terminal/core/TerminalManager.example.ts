/**
 * Example usage of TerminalManager
 * This file demonstrates how to use the TerminalManager class
 */

import { TerminalManager } from './TerminalManager';

// Example 1: Basic usage with default configuration
async function basicTerminalExample() {
  const container = document.getElementById('terminal');
  if (!container) {
    console.error('Terminal container not found');
    return;
  }

  const terminalManager = new TerminalManager(container);
  
  try {
    // Initialize all components
    await terminalManager.initialize();
    
    // Start boot sequence
    await terminalManager.startBootSequence();
    
    console.log('Terminal started successfully');
    
  } catch (error) {
    console.error('Failed to start terminal:', error);
  }
}

// Example 2: Custom configuration
async function customTerminalExample() {
  const container = document.getElementById('terminal');
  if (!container) {
    console.error('Terminal container not found');
    return;
  }

  const terminalManager = new TerminalManager(container, {
    fontSize: 20,
    fontFamily: 'Fira Code, monospace',
    cols: 120,
    rows: 40,
  });
  
  try {
    await terminalManager.initialize();
    await terminalManager.startBootSequence();
    
    // Trigger a glitch effect after boot
    setTimeout(() => {
      terminalManager.triggerGlitch('flicker');
    }, 5000);
    
  } catch (error) {
    console.error('Failed to start terminal:', error);
  }
}

// Example 3: Skip boot sequence
async function skipBootExample() {
  const container = document.getElementById('terminal');
  if (!container) {
    console.error('Terminal container not found');
    return;
  }

  const terminalManager = new TerminalManager(container);
  
  try {
    await terminalManager.initialize();
    
    // Skip boot sequence and go directly to interactive mode
    terminalManager.skipBootSequence();
    
    console.log('Boot sequence skipped, terminal ready');
    
  } catch (error) {
    console.error('Failed to start terminal:', error);
  }
}

// Example 4: Cleanup on component unmount
function cleanupExample() {
  const container = document.getElementById('terminal');
  if (!container) {
    console.error('Terminal container not found');
    return;
  }

  const terminalManager = new TerminalManager(container);
  
  // Initialize terminal
  terminalManager.initialize().then(() => {
    return terminalManager.startBootSequence();
  }).catch(console.error);
  
  // Cleanup when component is unmounted
  window.addEventListener('beforeunload', () => {
    terminalManager.cleanup();
  });
}

// Example 5: Access terminal components
async function accessComponentsExample() {
  const container = document.getElementById('terminal');
  if (!container) {
    console.error('Terminal container not found');
    return;
  }

  const terminalManager = new TerminalManager(container);
  
  try {
    await terminalManager.initialize();
    await terminalManager.startBootSequence();
    
    // Access terminal instance
    const terminal = terminalManager.getTerminal();
    console.log('Terminal instance:', terminal);
    
    // Access command handler
    const commandHandler = terminalManager.getCommandHandler();
    const availableCommands = commandHandler.getCommandNames();
    console.log('Available commands:', availableCommands);
    
    // Access input manager
    const inputManager = terminalManager.getInputManager();
    const history = inputManager.getHistory();
    console.log('Command history:', history);
    
  } catch (error) {
    console.error('Failed to start terminal:', error);
  }
}

// Export examples for use in components
export {
  basicTerminalExample,
  customTerminalExample,
  skipBootExample,
  cleanupExample,
  accessComponentsExample,
};