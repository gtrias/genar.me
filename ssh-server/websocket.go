package main

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"sync"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/log"
	"github.com/gorilla/websocket"
)

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow all origins for now (can be restricted in production)
		return true
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// TerminalSize represents terminal dimensions
type TerminalSize struct {
	Cols int `json:"cols"`
	Rows int `json:"rows"`
}

// WebSocketMessage represents messages sent over WebSocket
type WebSocketMessage struct {
	Type string      `json:"type"`
	Data interface{} `json:"data,omitempty"`
}

// WebSocketSession handles a WebSocket connection and bridges it to Bubble Tea
type WebSocketSession struct {
	conn   *websocket.Conn
	model  tea.Model
	program *tea.Program
	output chan []byte
	done   chan struct{}
	mu     sync.Mutex
	width  int
	height int
	logger *log.Logger
}

// NewWebSocketSession creates a new WebSocket session
func NewWebSocketSession(conn *websocket.Conn, logger *log.Logger) *WebSocketSession {
	return &WebSocketSession{
		conn:   conn,
		output: make(chan []byte, 256),
		done:   make(chan struct{}),
		width:  80,
		height: 24,
		logger: logger,
	}
}

// Start initializes and starts the Bubble Tea program
func (s *WebSocketSession) Start() error {
	// Create new model
	m := NewModel()
	m.width = s.width
	m.height = s.height
	s.model = m

	// Create Bubble Tea program (we'll manually handle updates)
	opts := []tea.ProgramOption{
		tea.WithoutSignalHandler(), // We handle signals via WebSocket
	}

	s.program = tea.NewProgram(s.model, opts...)

	// Start goroutine to periodically render and send updates
	go s.readFromProgram()

	// Start goroutine to write to WebSocket
	go s.writeToWebSocket()

	// Send initial render after a short delay
	time.Sleep(50 * time.Millisecond)
	s.renderAndSend()

	return nil
}

// readFromProgram reads output from the Bubble Tea program
func (s *WebSocketSession) readFromProgram() {
	// Periodically render and send updates (but less frequently to avoid overwriting user input)
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			// Only render if there's been no recent update (to avoid flicker)
			s.renderAndSend()
		case <-s.done:
			return
		}
	}
}

// renderAndSend renders the current model and sends it via WebSocket
func (s *WebSocketSession) renderAndSend() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.program == nil {
		return
	}

	// Get the current view
	view := s.model.View()
	if view != "" {
		// Clear screen and move cursor to top-left, then send view
		// ANSI escape codes: \x1b[2J = clear screen, \x1b[H = move to home
		// Use \x1b[?25l to hide cursor, \x1b[?25h to show it
		clearedView := "\x1b[2J\x1b[H\x1b[?25l" + view + "\x1b[?25h"
		
		s.logger.Info("Rendering view", "viewLen", len(view), "clearedLen", len(clearedView), "preview", view[:min(len(view), 100)])
		
		// Send as text message - use non-blocking send with timeout
		select {
		case s.output <- []byte(clearedView):
			s.logger.Info("View queued for sending", "size", len(clearedView))
		case <-time.After(100 * time.Millisecond):
			// Channel full, skip this update
			s.logger.Warn("Output channel full, skipping render")
		}
	} else {
		s.logger.Warn("View is empty, not rendering")
	}
}

// writeToWebSocket writes output to the WebSocket connection
func (s *WebSocketSession) writeToWebSocket() {
	for {
		select {
		case data := <-s.output:
			s.mu.Lock()
			err := s.conn.WriteMessage(websocket.TextMessage, data)
			s.mu.Unlock()
			if err != nil {
				s.logger.Error("Failed to write to WebSocket", "error", err)
				return
			} else {
				s.logger.Debug("Sent data to WebSocket", "size", len(data))
			}
		case <-s.done:
			return
		}
	}
}

// HandleInput processes input from the WebSocket
func (s *WebSocketSession) HandleInput(data []byte) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.program == nil {
		s.logger.Warn("HandleInput called but program is nil - program may not be initialized yet", "data", string(data), "bytes", data)
		return nil
	}

	// Parse input and send to program
	key := string(data)
	s.logger.Info("🔧 HandleInput called", "key", key, "keyQuoted", fmt.Sprintf("%q", key), "bytes", data, "len", len(data), "programIsNil", s.program == nil)
	
	// Handle special keys - convert to tea.KeyMsg format
	// Note: Bubble Tea's KeyMsg.String() method is used for matching in the TUI
	var msg tea.Msg
	switch key {
	case "\x1b[A":
		msg = tea.KeyMsg{Type: tea.KeyUp}
	case "\x1b[B":
		msg = tea.KeyMsg{Type: tea.KeyDown}
	case "\x1b[D":
		msg = tea.KeyMsg{Type: tea.KeyLeft}
	case "\x1b[C":
		msg = tea.KeyMsg{Type: tea.KeyRight}
	case "\r", "\n":
		msg = tea.KeyMsg{Type: tea.KeyEnter}
	case "\x1b":
		msg = tea.KeyMsg{Type: tea.KeyEsc}
	case "\x7f", "\b":
		msg = tea.KeyMsg{Type: tea.KeyBackspace}
	case "q":
		// "q" should be sent as a rune so String() returns "q"
		msg = tea.KeyMsg{Runes: []rune("q"), Type: tea.KeyRunes}
	case " ":
		msg = tea.KeyMsg{Type: tea.KeySpace}
	case "j":
		msg = tea.KeyMsg{Type: tea.KeyDown}
	case "k":
		msg = tea.KeyMsg{Type: tea.KeyUp}
	case "h":
		msg = tea.KeyMsg{Runes: []rune("h"), Type: tea.KeyRunes}
	default:
		// Regular character - send as rune
		if len(key) > 0 {
			// Handle single character
			if len(key) == 1 && key[0] >= 32 && key[0] < 127 {
				msg = tea.KeyMsg{Runes: []rune(key), Type: tea.KeyRunes}
			} else if len(key) > 1 {
				// Handle multi-character sequences (like escape sequences)
				// For now, just send the first character
				msg = tea.KeyMsg{Runes: []rune(string(key[0])), Type: tea.KeyRunes}
			}
		}
	}

	// Send message to program and update model
	if msg != nil {
		// Log the key message details
		if keyMsg, ok := msg.(tea.KeyMsg); ok {
			keyStr := keyMsg.String()
			runesStr := string(keyMsg.Runes)
			s.logger.Info("Processing key message", "key", key, "type", keyMsg.Type, "string", keyStr, "runes", runesStr, "runesLen", len(keyMsg.Runes))
			
			// Special debug logging for "h" and "q" keys
			if key == "h" || key == "q" {
				s.logger.Info("DEBUG: Special key detected", "originalKey", key, "KeyMsg.String()", keyStr, "KeyMsg.Runes", runesStr, "KeyMsg.Type", keyMsg.Type, "RunesMatch", len(keyMsg.Runes) == 1 && ((key == "h" && keyMsg.Runes[0] == 'h') || (key == "q" && keyMsg.Runes[0] == 'q')))
			}
		} else {
			s.logger.Info("Processing message", "msg", msg)
		}
		
		// Get the old view for comparison
		oldView := s.model.View()
		
		// Manually update the model (since we're not using Run())
		var cmd tea.Cmd
		s.model, cmd = s.model.Update(msg)
		
		// Execute command if any (commands are executed synchronously in Bubble Tea)
		if cmd != nil {
			cmdRes := cmd()
			if cmdRes != nil {
				// Update model with command result
				var cmd2 tea.Cmd
				s.model, cmd2 = s.model.Update(cmdRes)
				if cmd2 != nil {
					cmdRes2 := cmd2()
					if cmdRes2 != nil {
						s.model, _ = s.model.Update(cmdRes2)
					}
				}
			}
		}
		
		// Get the new view
		newView := s.model.View()
		s.logger.Info("Model updated", "oldViewLen", len(oldView), "newViewLen", len(newView), "changed", oldView != newView)
		
		// Force immediate render after update (don't wait for ticker)
		s.renderAndSend()
		
		// Also trigger a render after a small delay to ensure it's sent
		go func() {
			time.Sleep(50 * time.Millisecond)
			s.renderAndSend()
		}()
	} else {
		s.logger.Warn("No message created for input", "key", key, "bytes", data)
	}

	return nil
}

// HandleResize updates terminal size
func (s *WebSocketSession) HandleResize(size TerminalSize) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.width = size.Cols
	s.height = size.Rows

	// Update model size
	if m, ok := s.model.(*Model); ok {
		m.width = size.Cols
		m.height = size.Rows
	}

	// Send resize message to program
	if s.program != nil {
		s.program.Send(tea.WindowSizeMsg{
			Width:  size.Cols,
			Height: size.Rows,
		})
		s.renderAndSend()
	}
}

// Close closes the session
func (s *WebSocketSession) Close() {
	close(s.done)
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.conn != nil {
		s.conn.Close()
	}
}

// WebSocketHandler handles WebSocket connections
func WebSocketHandler(logger *log.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		logger.Info("WebSocket connection attempt", "remote", r.RemoteAddr, "path", r.URL.Path)
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			logger.Error("Failed to upgrade WebSocket", "error", err)
			return
		}
		defer conn.Close()

		logger.Info("*** WebSocket connection established successfully ***", "remote", r.RemoteAddr, "localAddr", conn.LocalAddr(), "remoteAddr", conn.RemoteAddr())

		session := NewWebSocketSession(conn, logger)
		if err := session.Start(); err != nil {
			logger.Error("Failed to start session", "error", err)
			return
		}
		defer session.Close()

		logger.Info("*** Session started, beginning read loop ***")
		
		// Verify connection is the same
		logger.Info("Connection verification", "handlerConn", fmt.Sprintf("%p", conn), "sessionConn", fmt.Sprintf("%p", session.conn), "same", conn == session.conn)
		
		// Test: Try to read connection state
		logger.Info("Connection state check", "subprotocol", conn.Subprotocol(), "remoteAddr", conn.RemoteAddr())
		
		// Read messages from WebSocket
		logger.Info("*** Starting message read loop ***")
		messageCount := 0
		lastLogTime := time.Now()
		firstIteration := true
		for {
			// Set read deadline to prevent indefinite blocking
			deadline := time.Now().Add(5 * time.Second)
			if err := conn.SetReadDeadline(deadline); err != nil {
				logger.Error("Failed to set read deadline", "error", err)
				break
			}
			messageCount++
			// Log first iteration and then every 2 seconds
			if firstIteration || time.Since(lastLogTime) > 2*time.Second {
				logger.Info("*** Waiting for message ***", "count", messageCount, "deadline", deadline.Format(time.RFC3339), "firstIteration", firstIteration)
				lastLogTime = time.Now()
				firstIteration = false
			}
			
			// Log before ReadMessage to see if we're actually blocking here
			logger.Debug("About to call ReadMessage", "count", messageCount, "time", time.Now().Format(time.RFC3339Nano))
			messageType, data, err := conn.ReadMessage()
			readTime := time.Now()
			logger.Debug("ReadMessage returned", "count", messageCount, "hasError", err != nil, "hasData", len(data) > 0, "time", readTime.Format(time.RFC3339Nano))
			if err != nil {
				// Check if it's a timeout (expected, continue reading)
				if netErr, ok := err.(net.Error); ok && netErr.Timeout() {
					// Log EVERY timeout now to see if we're getting stuck
					logger.Info("Read timeout", "count", messageCount, "error", err.Error(), "time", readTime.Format(time.RFC3339Nano))
					continue
				}
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					logger.Error("WebSocket error", "error", err)
				} else {
					logger.Info("WebSocket closed normally", "error", err)
				}
				break
			}

			// Reset read deadline since we got a message
			conn.SetReadDeadline(time.Time{})
			
			logger.Info("*** RECEIVED WebSocket message ***", "count", messageCount, "type", messageType, "size", len(data), "preview", string(data[:min(len(data), 100)]))

			switch messageType {
			case websocket.TextMessage:
				logger.Info("📨 Processing TextMessage", "dataLen", len(data), "preview", string(data[:min(len(data), 50)]), "rawBytes", data)
				// Try to parse as JSON (for resize messages)
				var msg WebSocketMessage
				unmarshalErr := json.Unmarshal(data, &msg)
				if unmarshalErr == nil && msg.Type == "resize" {
					// This is a resize message (JSON)
					logger.Info("✅ Received RESIZE message (JSON)", "type", msg.Type)
					if sizeData, ok := msg.Data.(map[string]interface{}); ok {
						size := TerminalSize{
							Cols: int(sizeData["cols"].(float64)),
							Rows: int(sizeData["rows"].(float64)),
						}
						logger.Info("Handling resize", "size", size)
						session.HandleResize(size)
						logger.Info("Resize handled, continuing loop")
					}
				} else {
					// This is raw terminal input (from AttachAddon)
					logger.Info("🎹 Received RAW TERMINAL INPUT (not JSON)", "size", len(data), "preview", string(data[:min(len(data), 50)]), "unmarshalErr", unmarshalErr)
					logger.Info("Calling HandleInput with raw data...")
					if err := session.HandleInput(data); err != nil {
						logger.Error("Error handling input", "error", err)
					} else {
						logger.Info("✓ HandleInput completed successfully")
					}
				}
			case websocket.BinaryMessage:
				// Handle binary input (for raw terminal data)
				logger.Debug("Received binary message", "size", len(data))
				if err := session.HandleInput(data); err != nil {
					logger.Error("Error handling binary input", "error", err)
				}
			}
			
			// Log that we're continuing the loop
			logger.Info("Finished processing message, continuing loop", "count", messageCount)
		}

		logger.Info("WebSocket connection closed")
	}
}

