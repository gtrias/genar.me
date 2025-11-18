package main

import (
	"fmt"
	"strings"
	"time"
)

// Command represents a terminal command
type Command struct {
	Name        string
	Description string
	Category    string
	Execute     func() string
}

// GetAllCommands returns all available commands
func GetAllCommands() []Command {
	return []Command{
		// Portfolio commands
		{
			Name:        "about",
			Description: "Learn about me",
			Category:    "portfolio",
			Execute:     aboutCommand,
		},
		{
			Name:        "skills",
			Description: "View my technical skills",
			Category:    "portfolio",
			Execute:     skillsCommand,
		},
		{
			Name:        "experience",
			Description: "View my work experience",
			Category:    "portfolio",
			Execute:     experienceCommand,
		},
		{
			Name:        "links",
			Description: "View my social links",
			Category:    "portfolio",
			Execute:     linksCommand,
		},
		// System commands
		{
			Name:        "help",
			Description: "Show all available commands",
			Category:    "system",
			Execute:     helpCommand,
		},
		{
			Name:        "date",
			Description: "Display current date and time",
			Category:    "system",
			Execute:     dateCommand,
		},
		{
			Name:        "whoami",
			Description: "Display current user info",
			Category:    "system",
			Execute:     whoamiCommand,
		},
	}
}

// aboutCommand displays personal bio
func aboutCommand() string {
	var sb strings.Builder

	sb.WriteString(Header("ABOUT ME"))
	sb.WriteString("\n\n")
	sb.WriteString(Label("Name: ") + Value("John Doe") + "\n")
	sb.WriteString(Label("Role: ") + Value("Full Stack Developer & Tech Enthusiast") + "\n")
	sb.WriteString(Label("Location: ") + Value("San Francisco, CA") + "\n\n")
	sb.WriteString(ContentStyle.Render("Hello! I'm a passionate developer who loves building\n"))
	sb.WriteString(ContentStyle.Render("innovative web applications and exploring cutting-edge\n"))
	sb.WriteString(ContentStyle.Render("technologies. With expertise in both frontend and backend\n"))
	sb.WriteString(ContentStyle.Render("development, I create seamless digital experiences that\n"))
	sb.WriteString(ContentStyle.Render("make a difference.\n\n"))
	sb.WriteString(ContentStyle.Foreground(PurpleColor).Render("When I'm not coding, you'll find me contributing to open\n"))
	sb.WriteString(ContentStyle.Foreground(PurpleColor).Render("source projects, mentoring aspiring developers, or diving\n"))
	sb.WriteString(ContentStyle.Foreground(PurpleColor).Render("into the latest tech trends.\n\n"))
	sb.WriteString(Dim("Type 'skills' or 'experience' to learn more about my background."))

	return sb.String()
}

// skillsCommand displays technical skills
func skillsCommand() string {
	var sb strings.Builder

	sb.WriteString(Header("TECHNICAL SKILLS"))
	sb.WriteString("\n\n")

	// ASCII table
	table := []string{
		TableBorderStyle.Render("┌────────────────────────┬──────────────────────────────────┐"),
		TableBorderStyle.Render("│ ") + TableHeaderStyle.Render("Category              ") + TableBorderStyle.Render(" │ ") + TableHeaderStyle.Render("Technologies                    ") + TableBorderStyle.Render(" │"),
		TableBorderStyle.Render("├────────────────────────┼──────────────────────────────────┤"),
		TableBorderStyle.Render("│ ") + TableCellStyle.Render("Frontend              ") + TableBorderStyle.Render(" │ ") + "React, Vue.js, TypeScript       " + TableBorderStyle.Render("│"),
		TableBorderStyle.Render("│                        │") + " Next.js, Astro, Tailwind CSS    " + TableBorderStyle.Render("│"),
		TableBorderStyle.Render("├────────────────────────┼──────────────────────────────────┤"),
		TableBorderStyle.Render("│ ") + TableCellStyle.Render("Backend               ") + TableBorderStyle.Render(" │ ") + "Node.js, Python, Go             " + TableBorderStyle.Render("│"),
		TableBorderStyle.Render("│                        │") + " Express, FastAPI, PostgreSQL    " + TableBorderStyle.Render("│"),
		TableBorderStyle.Render("├────────────────────────┼──────────────────────────────────┤"),
		TableBorderStyle.Render("│ ") + TableCellStyle.Render("DevOps & Tools        ") + TableBorderStyle.Render(" │ ") + "Docker, Kubernetes, AWS         " + TableBorderStyle.Render("│"),
		TableBorderStyle.Render("│                        │") + " Git, CI/CD, Terraform           " + TableBorderStyle.Render("│"),
		TableBorderStyle.Render("├────────────────────────┼──────────────────────────────────┤"),
		TableBorderStyle.Render("│ ") + TableCellStyle.Render("Databases             ") + TableBorderStyle.Render(" │ ") + "PostgreSQL, MongoDB, Redis      " + TableBorderStyle.Render("│"),
		TableBorderStyle.Render("│                        │") + " GraphQL, REST APIs              " + TableBorderStyle.Render("│"),
		TableBorderStyle.Render("├────────────────────────┼──────────────────────────────────┤"),
		TableBorderStyle.Render("│ ") + TableCellStyle.Render("Other                 ") + TableBorderStyle.Render(" │ ") + "WebSockets, WebAssembly         " + TableBorderStyle.Render("│"),
		TableBorderStyle.Render("│                        │") + " Testing, Agile, TDD             " + TableBorderStyle.Render("│"),
		TableBorderStyle.Render("└────────────────────────┴──────────────────────────────────┘"),
	}

	for _, line := range table {
		sb.WriteString(line + "\n")
	}

	sb.WriteString("\n")
	sb.WriteString(ContentStyle.Foreground(PurpleColor).Render("★ Proficiency Level: Expert ████████░░ (80%)"))
	sb.WriteString("\n")

	return sb.String()
}

// experienceCommand displays work experience
func experienceCommand() string {
	var sb strings.Builder

	sb.WriteString(Header("WORK EXPERIENCE"))
	sb.WriteString("\n\n")

	experiences := []struct {
		role     string
		company  string
		period   string
		desc     string
	}{
		{
			role:    "Senior Full Stack Developer",
			company: "Tech Innovators Inc.",
			period:  "2021 - Present",
			desc:    "Leading development of cloud-native applications, mentoring junior developers.",
		},
		{
			role:    "Full Stack Developer",
			company: "StartupXYZ",
			period:  "2019 - 2021",
			desc:    "Built scalable microservices architecture, implemented CI/CD pipelines.",
		},
		{
			role:    "Junior Developer",
			company: "WebDev Solutions",
			period:  "2017 - 2019",
			desc:    "Developed responsive web applications, collaborated on agile teams.",
		},
	}

	for i, exp := range experiences {
		sb.WriteString(Label(exp.role) + "\n")
		sb.WriteString(Value(exp.company) + " | " + Dim(exp.period) + "\n")
		sb.WriteString(ContentStyle.Render(exp.desc) + "\n")
		if i < len(experiences)-1 {
			sb.WriteString("\n")
		}
	}

	return sb.String()
}

// linksCommand displays social links
func linksCommand() string {
	var sb strings.Builder

	sb.WriteString(Header("SOCIAL LINKS"))
	sb.WriteString("\n\n")

	links := []struct {
		name string
		url  string
		icon string
	}{
		{"GitHub", "github.com/yourusername", "⚡"},
		{"LinkedIn", "linkedin.com/in/yourprofile", "💼"},
		{"Twitter", "twitter.com/yourhandle", "🐦"},
		{"Email", "your.email@example.com", "📧"},
		{"Website", "yourwebsite.com", "🌐"},
	}

	for _, link := range links {
		sb.WriteString(fmt.Sprintf("%s %s %s\n",
			link.icon,
			Label(link.name+":"),
			Value(link.url)))
	}

	sb.WriteString("\n")
	sb.WriteString(Dim("Feel free to reach out!"))

	return sb.String()
}

// helpCommand displays all available commands
func helpCommand() string {
	var sb strings.Builder

	sb.WriteString(Header("AVAILABLE COMMANDS"))
	sb.WriteString("\n\n")

	commands := GetAllCommands()

	// Group by category
	categories := map[string][]Command{
		"portfolio": {},
		"system":    {},
	}

	for _, cmd := range commands {
		categories[cmd.Category] = append(categories[cmd.Category], cmd)
	}

	// Portfolio commands
	sb.WriteString(Label("Portfolio:") + "\n")
	for _, cmd := range categories["portfolio"] {
		sb.WriteString(fmt.Sprintf("  %s %s\n",
			Value(padRight(cmd.Name, 12)),
			cmd.Description))
	}
	sb.WriteString("\n")

	// System commands
	sb.WriteString(Label("System:") + "\n")
	for _, cmd := range categories["system"] {
		sb.WriteString(fmt.Sprintf("  %s %s\n",
			Value(padRight(cmd.Name, 12)),
			cmd.Description))
	}
	sb.WriteString("\n")

	sb.WriteString(Dim("Navigation Tips:") + "\n")
	sb.WriteString("  • Use ↑↓ or j/k to navigate menu\n")
	sb.WriteString("  • Press Enter to select\n")
	sb.WriteString("  • Press 'q' to quit\n")

	return sb.String()
}

// dateCommand displays current date and time
func dateCommand() string {
	now := time.Now()
	return fmt.Sprintf("%s %s\n%s %s",
		Label("Date:"),
		Value(now.Format("Monday, January 2, 2006")),
		Label("Time:"),
		Value(now.Format("15:04:05 MST")))
}

// whoamiCommand displays user info
func whoamiCommand() string {
	return fmt.Sprintf("%s\n%s",
		Label("SSH User:"),
		Value("guest@genar.me"))
}

// Helper function to pad string to right
func padRight(str string, length int) string {
	if len(str) >= length {
		return str
	}
	return str + strings.Repeat(" ", length-len(str))
}
