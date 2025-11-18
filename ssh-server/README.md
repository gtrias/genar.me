# Genar.me SSH Portfolio Server

Interactive SSH portfolio terminal powered by [Charm](https://charm.sh) - Wish + Bubble Tea.

## Features

- 🎨 **Cyberpunk TUI** - Beautiful terminal UI with your brand colors
- 🔐 **SSH Access** - Secure, encrypted connections
- 📱 **Interactive Navigation** - Vim-style keys (j/k) + arrow keys
- 🎯 **Portfolio Commands** - About, Skills, Experience, Links
- 🚀 **Easy Deployment** - Docker + Fly.io ready

## Quick Start

### Local Development

```bash
# Build and run
go build -o genar-ssh
./genar-ssh

# Connect from another terminal
ssh localhost -p 23234
```

### Using Docker

```bash
# Build Docker image
docker build -t genar-ssh .

# Run container
docker run -p 23234:23234 genar-ssh

# Connect
ssh localhost -p 23234
```

## Deployment

### Option 1: Fly.io (Recommended)

Fly.io is perfect for SSH servers - free tier available!

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Deploy (first time)
flyctl launch
# Answer prompts:
# - Use existing fly.toml: Yes
# - Create postgres: No
# - Deploy now: Yes

# Get your app URL
flyctl info

# Connect
ssh your-app-name.fly.dev
```

### Option 2: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 3: Any VPS (DigitalOcean, Linode, etc.)

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Install Go
wget https://go.dev/dl/go1.23.0.linux-amd64.tar.gz
tar -C /usr/local -xzf go1.23.0.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin

# Clone and build
git clone <your-repo>
cd ssh-server
go build -o genar-ssh

# Run with systemd (create /etc/systemd/system/genar-ssh.service)
sudo systemctl enable genar-ssh
sudo systemctl start genar-ssh
```

## Configuration

### Change Port

Edit `main.go`:
```go
const port = "23234"  // Change this
```

Or use environment variable:
```bash
export SSH_PORT=2222
```

### Customize Content

Edit portfolio content in `commands.go`:
- `aboutCommand()` - Your bio
- `skillsCommand()` - Technical skills
- `experienceCommand()` - Work history
- `linksCommand()` - Social links

### Security Settings

The server currently allows **open access** for demo purposes.

For production:

1. **Disable password auth** in `main.go`:
```go
// Remove this entire block:
wish.WithPasswordAuth(func(ctx ssh.Context, password string) bool {
    return true
}),
```

2. **Restrict public keys**:
```go
wish.WithPublicKeyAuth(func(ctx ssh.Context, key ssh.PublicKey) bool {
    // Load authorized keys from file
    authorizedKeys := loadAuthorizedKeys(".ssh/authorized_keys")
    return checkKey(key, authorizedKeys)
}),
```

## Usage

Once connected via SSH:

### Navigation
- `↑` / `↓` or `j` / `k` - Navigate menu
- `Enter` / `Space` - Select command
- `ESC` / `Backspace` - Return to menu
- `h` - Quick help
- `q` - Quit

### Available Commands

**Portfolio:**
- `about` - Learn about me
- `skills` - View technical skills
- `experience` - Work experience
- `links` - Social links

**System:**
- `help` - Show all commands
- `date` - Current date/time
- `whoami` - User info

## Architecture

```
ssh client → Wish Server → Bubble Tea TUI → Commands
```

- **Wish** - SSH server framework
- **Bubble Tea** - TUI framework
- **Lipgloss** - Styling library
- **Commands** - Portfolio content

## Adding New Commands

1. Add command to `commands.go`:

```go
func myCommand() string {
    var sb strings.Builder
    sb.WriteString(Header("MY COMMAND"))
    sb.WriteString("\n\n")
    sb.WriteString("Hello from my command!")
    return sb.String()
}
```

2. Register in `GetAllCommands()`:

```go
{
    Name:        "mycommand",
    Description: "My awesome command",
    Category:    "portfolio",
    Execute:     myCommand,
},
```

3. Rebuild and restart:
```bash
go build -o genar-ssh && ./genar-ssh
```

## Customization

### Change Colors

Edit `styles.go`:
```go
CyanColor   = lipgloss.Color("#22e9d8")  // Your color
PinkColor   = lipgloss.Color("#e34880")  // Your color
```

### Change Banner

Edit `renderWelcome()` in `tui.go` - use ASCII art generators:
- [patorjk.com/software/taag](https://patorjk.com/software/taag/)
- [ascii-generator.site](https://ascii-generator.site/)

## Monitoring

### Fly.io Logs
```bash
flyctl logs
```

### Local Logs
```bash
./genar-ssh 2>&1 | tee ssh-server.log
```

## Cost Estimates

- **Fly.io**: Free tier (3 shared-cpu-1x, 256MB RAM)
- **Railway**: $5/month (usage-based)
- **DigitalOcean**: $4/month (512MB droplet)

## Troubleshooting

### Connection Refused
```bash
# Check if server is running
ps aux | grep genar-ssh

# Check port is listening
netstat -tlnp | grep 23234
```

### Host Key Verification Failed
```bash
# Remove old key
ssh-keygen -R localhost

# Or specify port
ssh-keygen -R [localhost]:23234
```

### Permission Denied
```bash
# Server needs to generate host keys
mkdir -p .ssh
chmod 700 .ssh
```

## Links

- [Charm.sh](https://charm.sh) - TUI framework
- [Wish](https://github.com/charmbracelet/wish) - SSH server
- [Bubble Tea](https://github.com/charmbracelet/bubbletea) - TUI library
- [Fly.io Docs](https://fly.io/docs/) - Deployment docs

## License

MIT
