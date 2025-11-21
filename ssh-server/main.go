package main

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/log"
	"github.com/charmbracelet/ssh"
	"github.com/charmbracelet/wish"
	"github.com/charmbracelet/wish/bubbletea"
	"github.com/charmbracelet/wish/logging"
)

const (
	host     = "0.0.0.0"
	port     = "23234"
	wsPort   = "8080" // WebSocket HTTP server port
)

func main() {
	// Setup logger with Info level to see all messages
	logger := log.NewWithOptions(os.Stderr, log.Options{
		ReportTimestamp: true,
		TimeFormat:      time.Kitchen,
		Prefix:          "Genar.me SSH 🚀",
		Level:           log.DebugLevel, // Show debug messages too
	})

	// Create SSH server
	s, err := wish.NewServer(
		wish.WithAddress(net.JoinHostPort(host, port)),
		wish.WithHostKeyPath(".ssh/id_ed25519"),
		wish.WithPublicKeyAuth(func(ctx ssh.Context, key ssh.PublicKey) bool {
			// Allow all public keys for now (open access)
			// In production, you'd want to validate against known keys
			return true
		}),
		wish.WithPasswordAuth(func(ctx ssh.Context, password string) bool {
			// Allow any password for demo purposes
			// In production, remove password auth or use proper validation
			return true
		}),
		wish.WithMiddleware(
			bubbletea.Middleware(teaHandler),
			logging.Middleware(),
		),
	)
	if err != nil {
		logger.Error("Failed to create server", "error", err)
		os.Exit(1)
	}

	// Start server
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	logger.Info("Starting SSH server", "host", host, "port", port)
	logger.Info("Connect with: ssh localhost -p " + port)

	// Start HTTP server for WebSocket connections
	mux := http.NewServeMux()
	
	// Add logging middleware
	loggingHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logger.Info("HTTP request received", "method", r.Method, "path", r.URL.Path, "remote", r.RemoteAddr)
		WebSocketHandler(logger)(w, r)
	})
	
	mux.HandleFunc("/ws", loggingHandler)
	
	httpServer := &http.Server{
		Addr:    net.JoinHostPort(host, wsPort),
		Handler: mux,
	}

	logger.Info("*** Starting WebSocket server ***", "host", host, "port", wsPort, "endpoint", "/ws")
	logger.Info("WebSocket handler registered", "fullURL", fmt.Sprintf("ws://%s:%s/ws", host, wsPort))

	go func() {
		if err = s.ListenAndServe(); err != nil && !errors.Is(err, ssh.ErrServerClosed) {
			logger.Error("SSH server error", "error", err)
			done <- os.Interrupt
		}
	}()

	go func() {
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("HTTP server error", "error", err)
			done <- os.Interrupt
		}
	}()

	<-done
	logger.Info("Stopping servers")
	
	// Shutdown SSH server
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := s.Shutdown(ctx); err != nil && !errors.Is(err, ssh.ErrServerClosed) {
		logger.Error("Failed to shutdown SSH server", "error", err)
	}
	
	// Shutdown HTTP server
	ctx2, cancel2 := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel2()
	if err := httpServer.Shutdown(ctx2); err != nil {
		logger.Error("Failed to shutdown HTTP server", "error", err)
	}
}

// teaHandler creates a new Bubble Tea program for each SSH session
func teaHandler(s ssh.Session) (tea.Model, []tea.ProgramOption) {
	// Get terminal size
	pty, _, active := s.Pty()
	if !active {
		fmt.Fprintln(s, "No active terminal, skipping")
		return nil, nil
	}

	// Create new model for this session
	m := NewModel()
	m.width = pty.Window.Width
	m.height = pty.Window.Height

	// Configure Bubble Tea program options
	opts := []tea.ProgramOption{
		tea.WithAltScreen(),       // Use alternate screen buffer
		tea.WithMouseCellMotion(), // Enable mouse support
	}

	return m, opts
}
