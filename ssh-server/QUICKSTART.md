# SSH Portfolio - Quick Start Guide

## ✅ What Was Built

You now have a complete **SSH-based portfolio server** using Charm's Wish + Bubble Tea stack, following the terminal.shop model!

### 📦 Components Created

```
ssh-server/
├── main.go              # Wish SSH server (entry point)
├── tui.go               # Bubble Tea TUI with menu navigation
├── commands.go          # Portfolio content (about, skills, etc.)
├── styles.go            # Cyberpunk styling with Lipgloss
├── Dockerfile           # Container deployment
├── fly.toml             # Fly.io deployment config
├── README.md            # Full documentation
└── test-connection.sh   # Local testing script
```

### 🎨 Features Implemented

- ✅ **Interactive Menu** - Navigate with j/k/arrows, Enter to select
- ✅ **Portfolio Commands** - about, skills, experience, links
- ✅ **System Commands** - help, date, whoami
- ✅ **Cyberpunk Theme** - Matches your website's color scheme
- ✅ **ASCII Art Banner** - Cool welcome screen
- ✅ **Open Access** - Anyone can connect (demo mode)
- ✅ **Deployment Ready** - Docker + Fly.io configs included
- ✅ **Website Integration** - Banner component advertises SSH access

## 🚀 Try It Now

### 1. Start the Server Locally

```bash
cd ssh-server

# Build (if not already built)
go build -o genar-ssh

# Run
./genar-ssh
```

You should see:
```
INFO Starting SSH server host=0.0.0.0 port=23234
INFO Connect with: ssh localhost -p 23234
```

### 2. Connect via SSH

**From another terminal:**
```bash
ssh localhost -p 23234
```

Or use the test script:
```bash
./test-connection.sh
```

**What to expect:**
1. Beautiful ASCII banner with your name
2. Interactive menu with command categories
3. Navigate with ↑↓ or j/k
4. Press Enter to view command output
5. Press ESC to return to menu
6. Press 'q' to quit

### 3. Test the Website Banner

```bash
cd ..  # Back to main project
npm run dev
```

Visit http://localhost:4321 - you'll see a floating banner at the top:
```
🔐 Power users: ssh localhost -p 23234
```

Features:
- Click command to copy
- Click ✕ to dismiss (saves in localStorage)
- Auto-dismisses after 30 seconds
- Mobile responsive

## 📝 Customization

### Update Portfolio Content

Edit `ssh-server/commands.go`:

```go
func aboutCommand() string {
    // Change your name, role, location
    sb.WriteString(Label("Name: ") + Value("Your Name"))
    sb.WriteString(Label("Role: ") + Value("Your Title"))
    // ...
}

func skillsCommand() string {
    // Update your tech stack
    // ...
}
```

Then rebuild:
```bash
go build -o genar-ssh
```

### Change Colors

Edit `ssh-server/styles.go`:
```go
CyanColor   = lipgloss.Color("#YOUR_COLOR")
PinkColor   = lipgloss.Color("#YOUR_COLOR")
```

### Customize Banner

Edit `tui.go` → `renderWelcome()` function.

Generate ASCII art at: https://patorjk.com/software/taag/

## 🌐 Deploy to Production

### Option 1: Fly.io (Recommended - Free Tier Available)

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Deploy
cd ssh-server
flyctl launch

# Your app will be at: your-app-name.fly.dev
# Connect with: ssh your-app-name.fly.dev
```

**Update website banner** in `src/components/SSHBanner.astro`:
```html
<code class="ssh-command">ssh your-app-name.fly.dev</code>
```

### Option 2: Docker (Any Platform)

```bash
cd ssh-server

# Build
docker build -t genar-ssh .

# Run
docker run -p 23234:23234 genar-ssh

# Or push to registry
docker tag genar-ssh your-registry/genar-ssh
docker push your-registry/genar-ssh
```

### Option 3: VPS

```bash
# SSH into VPS
ssh your-vps

# Install Go
wget https://go.dev/dl/go1.23.0.linux-amd64.tar.gz
tar -C /usr/local -xzf go1.23.0.linux-amd64.tar.gz

# Clone and build
git clone your-repo
cd ssh-server
/usr/local/go/bin/go build -o genar-ssh

# Run with systemd (see README.md)
```

## 🔒 Security Notes

**Current Setup: DEMO MODE** ☠️

The server currently allows **anyone** to connect with **any password**.

### For Production:

1. **Disable password auth** (remove `WithPasswordAuth` in main.go)
2. **Add SSH key validation** (implement proper `WithPublicKeyAuth`)
3. **Rate limiting** (add middleware)
4. **Monitoring** (use logging middleware)

See `README.md` for detailed security hardening.

## 🎯 Next Steps

### Immediate:
1. ✅ Customize portfolio content in `commands.go`
2. ✅ Test locally: `./genar-ssh` + `ssh localhost -p 23234`
3. ✅ Deploy to Fly.io (or your preferred platform)
4. ✅ Update website banner with production URL

### Future Enhancements:
- 🎨 Add more commands (projects, blog, resume download)
- 🎮 Add Easter eggs (matrix, snake game, etc.)
- 📊 Add analytics/visitor counter
- 🔐 Implement proper authentication
- 💾 Add session persistence
- 🌍 Multi-language support

## 📚 Architecture Comparison

### Option B (What You Built) ✅
```
User Terminal → SSH → Wish Server → Bubble Tea TUI → Commands
```

**Pros:**
- ✅ Proven (terminal.shop uses this)
- ✅ Encrypted by default (SSH)
- ✅ Native terminal UX
- ✅ Separate from web app (clean architecture)

**Cons:**
- ❌ Requires SSH client
- ❌ Not browser-based

### Option A (Future Enhancement)
```
Browser → xterm.js → WebSocket → Go → Commands
```

You can add this later if you want **both** approaches!

## 🎉 Success Criteria

You've successfully implemented Option B if:

- ✅ SSH server runs: `./genar-ssh`
- ✅ Can connect: `ssh localhost -p 23234`
- ✅ See interactive menu with portfolio commands
- ✅ Navigation works (j/k/arrows)
- ✅ Commands display correct content
- ✅ Website shows SSH banner
- ✅ Ready to deploy

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Find what's using port 23234
lsof -i :23234

# Kill it
kill -9 <PID>
```

### Host Key Verification Failed
```bash
# Remove old key
ssh-keygen -R [localhost]:23234
```

### Connection Refused
```bash
# Check server is running
ps aux | grep genar-ssh

# Check port is listening
netstat -tlnp | grep 23234
```

## 📞 Support

- **Charm Docs**: https://charm.sh
- **Wish GitHub**: https://github.com/charmbracelet/wish
- **Bubble Tea Tutorial**: https://github.com/charmbracelet/bubbletea/tree/master/tutorials

---

**Built with ❤️ using Charm's amazing TUI tools**

Now go customize your portfolio and deploy! 🚀
