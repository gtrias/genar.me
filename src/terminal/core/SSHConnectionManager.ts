/**
 * SSH Connection Manager
 * Manages WebSocket connection to SSH server and forwards terminal I/O
 */

import { Terminal } from '@xterm/xterm';

export interface SSHConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  connectionTimeout?: number;
}

export enum ConnectionStatus {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
  Error = 'error',
}

export interface WebSocketMessage {
  type: 'input' | 'resize';
  data?: string | { cols: number; rows: number };
}

export class SSHConnectionManager {
  private terminal: Terminal;
  private config: SSHConfig;
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = ConnectionStatus.Disconnected;
  private reconnectAttempts = 0;
  private reconnectTimer?: number;
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private shouldReconnect = true;

  constructor(terminal: Terminal, config: SSHConfig) {
    this.terminal = terminal;
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      connectionTimeout: 10000,
      ...config,
    };
  }

  /**
   * Connect to the SSH server via WebSocket
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('Already connected');
      return;
    }

    this.setStatus(ConnectionStatus.Connecting);

    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(this.config.url);

        const timeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            ws.close();
            reject(new Error('Connection timeout'));
          }
        }, this.config.connectionTimeout);

        ws.onopen = () => {
          clearTimeout(timeout);
          this.ws = ws;
          this.reconnectAttempts = 0;
          this.setStatus(ConnectionStatus.Connected);
          
          // Send initial terminal size
          this.sendResize();
          
          // Setup terminal event handlers
          this.setupTerminalHandlers();
          
          // Focus the terminal to ensure it receives keyboard input
          this.terminal.focus();
          
          resolve();
        };

        ws.onmessage = (event) => {
          // Handle text messages (terminal output)
          if (typeof event.data === 'string') {
            console.log('Received message from server:', { 
              length: event.data.length, 
              preview: event.data.substring(0, 100),
              hasAnsi: event.data.includes('\x1b')
            });
            this.terminal.write(event.data);
          } else if (event.data instanceof ArrayBuffer) {
            // Handle binary messages if needed
            const decoder = new TextDecoder();
            const text = decoder.decode(event.data);
            console.log('Received binary message from server:', { length: text.length });
            this.terminal.write(text);
          }
        };

        ws.onerror = (error) => {
          clearTimeout(timeout);
          console.error('WebSocket error:', error);
          this.setStatus(ConnectionStatus.Error);
          reject(error);
        };

        ws.onclose = (event) => {
          clearTimeout(timeout);
          this.ws = null;
          
          if (!this.shouldReconnect) {
            this.setStatus(ConnectionStatus.Disconnected);
            return;
          }

          // Attempt to reconnect
          if (this.reconnectAttempts < (this.config.maxReconnectAttempts || 10)) {
            this.setStatus(ConnectionStatus.Reconnecting);
            this.scheduleReconnect();
          } else {
            this.setStatus(ConnectionStatus.Error);
            console.error('Max reconnection attempts reached');
          }
        };
      } catch (error) {
        this.setStatus(ConnectionStatus.Error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the SSH server
   */
  disconnect(): void {
    this.shouldReconnect = false;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.setStatus(ConnectionStatus.Disconnected);
  }

  /**
   * Send terminal input to the server
   */
  sendInput(data: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'input',
        data: data,
      };
      const jsonMessage = JSON.stringify(message);
      console.log('Sending input to server:', { data, message: jsonMessage, readyState: this.ws.readyState });
      
      try {
        this.ws.send(jsonMessage);
        console.log('Input sent successfully');
      } catch (error) {
        console.error('Error sending input:', error);
      }
    } else {
      console.warn('WebSocket not open, cannot send input', { readyState: this.ws?.readyState });
    }
  }

  /**
   * Send terminal resize event to the server
   */
  sendResize(): void {
    if (this.ws?.readyState === WebSocket.OPEN && this.terminal) {
      const message: WebSocketMessage = {
        type: 'resize',
        data: {
          cols: this.terminal.cols,
          rows: this.terminal.rows,
        },
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Setup terminal event handlers
   */
  private setupTerminalHandlers(): void {
    // Handle terminal input
    this.terminal.onData((data: string) => {
      console.log('Terminal input received:', { data, charCode: data.charCodeAt(0), length: data.length });
      this.sendInput(data);
    });

    // Handle terminal resize
    this.terminal.onResize(() => {
      this.sendResize();
    });
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectAttempts++;
    const delay = (this.config.reconnectInterval || 3000) * this.reconnectAttempts;

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = undefined;
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Set connection status and notify listeners
   */
  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.statusListeners.forEach((listener) => listener(status));
    }
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Add a status change listener
   */
  onStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.status === ConnectionStatus.Connected && 
           this.ws?.readyState === WebSocket.OPEN;
  }
}

