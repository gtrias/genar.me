# Terminal Interactive Mode Fix - Summary

## The Core Problem

The terminal was not working in interactive mode because **TWO HANDLERS** were competing for control:

1. **Local Mode Handler** - Manual `terminal.onData()` for local shell commands
2. **AttachAddon** - Automatic handler for WebSocket SSH connections

### What Was Happening

```
User types 'h' in WebSocket mode:
  ↓
Local Mode Handler intercepts it (registered first)
  ↓
Returns early (because isWebSocketMode = true)
  ↓
AttachAddon NEVER SEES THE INPUT
  ↓
Nothing happens!
```

## The Solution

### 1. Handler Lifecycle Management

We now properly manage the lifecycle of event handlers:

**On WebSocket Connect:**
```typescript
// DISPOSE local mode handler first
localModeDisposable?.dispose();
localModeDisposable = null;

// THEN load AttachAddon (gets exclusive control)
attachAddon = new AttachAddon(ws);
terminal.loadAddon(attachAddon);
```

**On WebSocket Disconnect:**
```typescript
// Dispose AttachAddon
attachAddon?.dispose();
attachAddon = null;

// Re-register local mode handler
registerLocalModeHandler();
```

### 2. Clear Separation of Modes

**Local Mode:**
- One `onData` handler for manual input processing
- Manual command execution
- Manual output rendering

**WebSocket Mode:**
- AttachAddon has EXCLUSIVE control
- Automatic bidirectional I/O
- Raw byte streams (not JSON)
- ANSI colors preserved

### 3. Resize Message Handling

Resize messages are sent **BEFORE** AttachAddon loads:
```typescript
// Send resize FIRST (as JSON)
ws.send(JSON.stringify({ type: 'resize', data: { cols, rows } }));

// THEN load AttachAddon (raw data only)
terminal.loadAddon(attachAddon);
```

## Architecture

### Local Mode Flow
```
User types → onData → Shell.executeCommand() → terminal.write()
```

### WebSocket Mode Flow
```
User types → AttachAddon → WebSocket (raw) → Server
Server → WebSocket (ANSI) → AttachAddon → Terminal displays
```

### Resize Flow
```
Window resize → ws.send(JSON) → Server parses JSON → Adjusts TUI size
```

## Key Changes

### Terminal.tsx

1. **Added handler lifecycle management:**
   - `localModeDisposable` to store the local handler
   - `registerLocalModeHandler()` function to register it
   - Dispose local handler before loading AttachAddon
   - Re-register local handler when AttachAddon is disposed

2. **Removed conflicting logic:**
   - No more early returns in onData for WebSocket mode
   - No more tracking `wsCurrentLine` for exit detection
   - No more mixing manual and automatic handling

3. **Enhanced logging:**
   - Clear console logs showing handler lifecycle
   - Visual indicators (✓, ⚠️, 📐, 📝) for key operations

### Server (websocket.go)

No changes needed! The server already correctly:
- Accepts JSON for resize messages
- Accepts raw text for terminal input
- Sends raw ANSI output back to client

## Why It Works Now

1. **No Handler Conflicts:** Only ONE handler is active at a time
2. **Exclusive Control:** AttachAddon has full control in WebSocket mode
3. **Proper Cleanup:** Handlers are disposed and re-registered correctly
4. **Raw Data Flow:** AttachAddon sends/receives raw bytes preserving ANSI codes
5. **Colors Work:** ANSI escape sequences flow through AttachAddon untouched

## Testing Checklist

- [ ] Local mode works (type commands, see output)
- [ ] Can connect to SSH (run `ssh` command)
- [ ] WebSocket mode is interactive (can press 'h', 'q', arrow keys)
- [ ] Colors are displayed correctly in SSH mode
- [ ] Can navigate menu with arrow keys
- [ ] Can quit with 'q'
- [ ] Terminal disconnects cleanly
- [ ] Can reconnect after disconnect
- [ ] Local mode works again after disconnect
- [ ] Window resize is handled correctly

## Debug Console Output

When connecting to WebSocket, you should see:

```
═══════════════════════════════════════
WebSocket connected successfully
═══════════════════════════════════════
⚠️  Disposing local mode handler to give AttachAddon exclusive control
✓ Local mode handler disposed
📐 Sending initial resize: {"type":"resize","data":{"cols":80,"rows":24}}
✓ AttachAddon loaded - terminal is now interactive
✓ AttachAddon now has EXCLUSIVE control of terminal I/O
  - All keyboard input goes directly to WebSocket as raw bytes
  - All WebSocket output goes directly to terminal with ANSI colors
```

## Related Documentation

- [xterm.js AttachAddon](https://github.com/xtermjs/xterm.js/tree/master/addons/addon-attach)
- [Architecture Analysis](./TERMINAL_ARCHITECTURE_ANALYSIS.md)

