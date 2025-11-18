package main

import "github.com/charmbracelet/lipgloss"

// Cyberpunk color scheme matching the website
var (
	// Primary colors
	CyanColor   = lipgloss.Color("#22e9d8")
	PinkColor   = lipgloss.Color("#e34880")
	PurpleColor = lipgloss.Color("#8b5cf6")
	GreenColor  = lipgloss.Color("#10b981")
	YellowColor = lipgloss.Color("#fbbf24")
	RedColor    = lipgloss.Color("#ef4444")

	// Background/Text colors
	DarkBg    = lipgloss.Color("#0a0a0f")
	LightText = lipgloss.Color("#f9fafb")
	DimText   = lipgloss.Color("#9ca3af")
)

// Style definitions
var (
	// Title styles
	TitleStyle = lipgloss.NewStyle().
			Foreground(CyanColor).
			Bold(true).
			Padding(1, 2)

	// Menu styles
	MenuTitleStyle = lipgloss.NewStyle().
			Foreground(CyanColor).
			Bold(true).
			Border(lipgloss.RoundedBorder()).
			BorderForeground(CyanColor).
			Padding(0, 1)

	SelectedItemStyle = lipgloss.NewStyle().
				Foreground(PinkColor).
				Bold(true).
				PaddingLeft(2)

	NormalItemStyle = lipgloss.NewStyle().
			Foreground(LightText).
			PaddingLeft(4)

	// Content styles
	HeaderStyle = lipgloss.NewStyle().
			Foreground(CyanColor).
			Bold(true).
			Border(lipgloss.DoubleBorder()).
			BorderForeground(CyanColor).
			Padding(0, 2).
			Width(60)

	ContentStyle = lipgloss.NewStyle().
			Foreground(LightText).
			Padding(1, 2)

	LabelStyle = lipgloss.NewStyle().
			Foreground(GreenColor).
			Bold(true)

	ValueStyle = lipgloss.NewStyle().
			Foreground(YellowColor)

	DimStyle = lipgloss.NewStyle().
			Foreground(DimText).
			Italic(true)

	// Help text
	HelpStyle = lipgloss.NewStyle().
			Foreground(DimText).
			Padding(1, 2)

	// Box drawing
	BoxStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(PurpleColor).
			Padding(1, 2).
			Width(60)

	// ASCII art table styles
	TableBorderStyle = lipgloss.NewStyle().
				Foreground(YellowColor)

	TableHeaderStyle = lipgloss.NewStyle().
				Foreground(GreenColor).
				Bold(true)

	TableCellStyle = lipgloss.NewStyle().
			Foreground(LightText)
)

// Helper functions for common formatting
func Header(text string) string {
	return HeaderStyle.Render(text)
}

func Label(text string) string {
	return LabelStyle.Render(text)
}

func Value(text string) string {
	return ValueStyle.Render(text)
}

func Dim(text string) string {
	return DimStyle.Render(text)
}

func Box(content string) string {
	return BoxStyle.Render(content)
}
