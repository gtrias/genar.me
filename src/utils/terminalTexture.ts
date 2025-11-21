import { Terminal } from '@xterm/xterm';
import * as THREE from 'three';

/**
 * Creates a three.js texture from the xterm.js terminal canvas
 * Requires xterm-addon-canvas to be loaded on the terminal
 */
export function createTerminalTexture(terminal: Terminal): THREE.CanvasTexture {
  // Access the terminal's internal element
  const terminalElement = terminal.element;
  if (!terminalElement) {
    throw new Error('Terminal element not found');
  }

  // With xterm-addon-canvas, the canvas should be directly accessible
  const canvas = terminalElement.querySelector('canvas') as HTMLCanvasElement;
  
  if (!canvas) {
    throw new Error('Terminal canvas not found - make sure xterm-addon-canvas is loaded');
  }

  // Create a three.js texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;
  
  // Update texture when canvas changes
  texture.needsUpdate = true;
  
  return texture;
}

/**
 * Updates the texture to reflect current terminal canvas state
 */
export function updateTerminalTexture(texture: THREE.CanvasTexture): void {
  texture.needsUpdate = true;
}
