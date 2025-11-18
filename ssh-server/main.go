package main

import (
	"context"
	"errors"
	"fmt"
	"net"
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
	host = "0.0.0.0"
	port = "23234"
)

func main() {
	// Setup logger
	logger := log.NewWithOptions(os.Stderr, log.Options{
		ReportTimestamp: true,
		TimeFormat:      time.Kitchen,
		Prefix:          "Genar.me SSH 🚀",
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

	go func() {
		if err = s.ListenAndServe(); err != nil && !errors.Is(err, ssh.ErrServerClosed) {
			logger.Error("Server error", "error", err)
			done <- os.Interrupt
		}
	}()

	<-done
	logger.Info("Stopping SSH server")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := s.Shutdown(ctx); err != nil && !errors.Is(err, ssh.ErrServerClosed) {
		logger.Error("Failed to shutdown server", "error", err)
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
