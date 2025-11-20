package main

import (
	"fmt"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// ViewMode represents the current view state
type ViewMode int

const (
	MenuMode ViewMode = iota
	ContentMode
)

// Model represents the Bubble Tea application model
type Model struct {
	commands      []Command
	cursor        int
	selectedCmd   *Command
	mode          ViewMode
	width         int
	height        int
	welcomeShown  bool
}

// NewModel creates a new TUI model
func NewModel() Model {
	return Model{
		commands:     GetAllCommands(),
		cursor:       0,
		mode:         MenuMode,
		welcomeShown: false,
	}
}

// Init initializes the model
func (m Model) Init() tea.Cmd {
	return nil
}

// Update handles messages and updates the model
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		return m, nil

	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
			// Allow quit from any mode
			return m, tea.Quit

		case "esc", "backspace":
			// Return to menu from content view
			if m.mode == ContentMode {
				m.mode = MenuMode
				m.selectedCmd = nil
			}
			return m, nil

		case "up", "k":
			// Navigate up in menu
			if m.mode == MenuMode && m.cursor > 0 {
				m.cursor--
			}
			return m, nil

		case "down", "j":
			// Navigate down in menu
			if m.mode == MenuMode && m.cursor < len(m.commands)-1 {
				m.cursor++
			}
			return m, nil

		case "enter", " ":
			// Select command
			if m.mode == MenuMode {
				m.selectedCmd = &m.commands[m.cursor]
				m.mode = ContentMode
			}
			return m, nil

		case "h":
			// Quick help shortcut
			if m.mode == MenuMode {
				for i, cmd := range m.commands {
					if cmd.Name == "help" {
						m.cursor = i
						m.selectedCmd = &m.commands[i]
						m.mode = ContentMode
						break
					}
				}
			}
			return m, nil
		}
	}

	return m, nil
}

// View renders the TUI
func (m Model) View() string {
	var sb strings.Builder

	// Welcome banner on first render
	if !m.welcomeShown {
		m.welcomeShown = true
		sb.WriteString(m.renderWelcome())
		sb.WriteString("\n\n")
	}

	switch m.mode {
	case MenuMode:
		sb.WriteString(m.renderMenu())
	case ContentMode:
		sb.WriteString(m.renderContent())
	}

	return sb.String()
}

// renderWelcome displays the welcome banner
func (m Model) renderWelcome() string {
	var sb strings.Builder

	banner := []string{
		"  ██████╗ ███████╗███╗   ██╗ █████╗ ██████╗ ",
		" ██╔════╝ ██╔════╝████╗  ██║██╔══██╗██╔══██╗",
		" ██║  ███╗█████╗  ██╔██╗ ██║███████║██████╔╝",
		" ██║   ██║██╔══╝  ██║╚██╗██║██╔══██║██╔══██╗",
		" ╚██████╔╝███████╗██║ ╚████║██║  ██║██║  ██║",
		"  ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝",
	}

	bannerStyle := lipgloss.NewStyle().
		Foreground(CyanColor).
		Bold(true)

	for _, line := range banner {
		sb.WriteString(bannerStyle.Render(line) + "\n")
	}

	sb.WriteString("\n")
	sb.WriteString(lipgloss.NewStyle().
		Foreground(PinkColor).
		Bold(true).
		Render("                    Welcome to my SSH Portfolio Terminal!") + "\n")
	sb.WriteString("\n")
	sb.WriteString(Dim("                Navigate with ↑↓/jk, Enter to select, 'q' to quit, ESC to go back") + "\n")

	return sb.String()
}

// renderMenu displays the command menu
func (m Model) renderMenu() string {
	var sb strings.Builder

	sb.WriteString(MenuTitleStyle.Render(" SELECT A COMMAND "))
	sb.WriteString("\n\n")

	// Group commands by category
	portfolioCmds := []Command{}
	systemCmds := []Command{}

	for _, cmd := range m.commands {
		if cmd.Category == "portfolio" {
			portfolioCmds = append(portfolioCmds, cmd)
		} else {
			systemCmds = append(systemCmds, cmd)
		}
	}

	// Render portfolio commands
	sb.WriteString(Label("Portfolio Commands:") + "\n")
	currentIdx := 0
	for _, cmd := range portfolioCmds {
		if currentIdx == m.cursor {
			sb.WriteString(SelectedItemStyle.Render(fmt.Sprintf("▸ %s - %s", cmd.Name, cmd.Description)) + "\n")
		} else {
			sb.WriteString(NormalItemStyle.Render(fmt.Sprintf("  %s - %s", cmd.Name, cmd.Description)) + "\n")
		}
		currentIdx++
	}

	sb.WriteString("\n")

	// Render system commands
	sb.WriteString(Label("System Commands:") + "\n")
	for _, cmd := range systemCmds {
		if currentIdx == m.cursor {
			sb.WriteString(SelectedItemStyle.Render(fmt.Sprintf("▸ %s - %s", cmd.Name, cmd.Description)) + "\n")
		} else {
			sb.WriteString(NormalItemStyle.Render(fmt.Sprintf("  %s - %s", cmd.Name, cmd.Description)) + "\n")
		}
		currentIdx++
	}

	sb.WriteString("\n")
	sb.WriteString(HelpStyle.Render("Press 'h' for help, 'q' to quit"))

	return sb.String()
}

// renderContent displays the selected command output
func (m Model) renderContent() string {
	if m.selectedCmd == nil {
		return "No command selected"
	}

	var sb strings.Builder

	// Execute the command and display output
	output := m.selectedCmd.Execute()
	sb.WriteString(output)

	sb.WriteString("\n\n")
	sb.WriteString(HelpStyle.Render("Press ESC or Backspace to return to menu, 'q' to quit"))

	return sb.String()
}
