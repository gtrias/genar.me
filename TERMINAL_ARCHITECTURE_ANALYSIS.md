# Terminal Architecture Analysis

## Current Problems

### 1. Mixed Mode Handling
The terminal has TWO different operating modes that conflict:

**Local Mode (works):**
- `terminal.onData()` captures all input manually
- Manual line buffering with `currentLine`
- Manual command execution with `shell.executeCommand()`
- Manual output with `terminal.write()`

**WebSocket Mode (broken):**
- AttachAddon tries to handle I/O automatically
- BUT `terminal.onData()` is still active and intercepting
- Creates conflict: both manual handler AND AttachAddon see the same data

### 2. AttachAddon Expectations
AttachAddon is designed for PURE raw data streams:
```
User types 'h' → AttachAddon → WebSocket (raw byte 'h') → Server
Server output → WebSocket (raw ANSI) → AttachAddon → Terminal displays
```

AttachAddon does NOT handle:
- JSON messages (resize, commands, etc.)
- Line buffering
- Local command execution

### 3. Resize Message Problem
Current flow:
1. Connect WebSocket
2. Send resize JSON message
3. Load AttachAddon
4. AttachAddon now controls ALL WebSocket communication
5. Any resize messages sent later go through AttachAddon
6. Server receives resize JSON, but might also receive it as terminal input

### 4. The Real Issue
When `terminal.onData()` is called with AttachAddon loaded:
- Our handler runs FIRST (line 186-223)
- Even though we return early, we've already intercepted the data
- AttachAddon might not get the data, OR both get it (race condition)

## Root Cause

**We're trying to mix two incompatible approaches:**
1. Manual terminal I/O handling (local mode)
2. Automatic AttachAddon handling (WebSocket mode)

They both want exclusive control of `terminal.onData()`.

## Solution Architecture

### Option A: Pure AttachAddon (Recommended)
- Use AttachAddon exclusively for WebSocket mode
- Unregister manual `onData` handler when AttachAddon loads
- Handle resize through a separate WebSocket message protocol
- Server must distinguish between:
  - Control messages (JSON): resize, etc.
  - Terminal data (raw): keyboard input, ANSI output

### Option B: Separate Channel for Resize
- Keep AttachAddon for terminal I/O only
- Use a DIFFERENT WebSocket connection for control messages
- One WS for terminal data (AttachAddon)
- One WS for control (resize, status, etc.)

### Option C: No AttachAddon (Current Approach)
- Remove AttachAddon entirely
- Handle everything manually like local mode
- Manually send input as JSON
- Manually write output from JSON responses
- More control but more complex

## Recommended Fix

Use Option A with proper handler management:

1. **Store the onData disposable:**
```typescript
let localModeDisposable: IDisposable | null = null;
```

2. **Register handler conditionally:**
```typescript
// Only for local mode
localModeDisposable = terminal.onData((data) => {
  if (isWebSocketMode) return; // Safety check
  // ... manual handling
});
```

3. **When connecting WebSocket:**
```typescript
// Dispose local handler
localModeDisposable?.dispose();
localModeDisposable = null;

// Load AttachAddon
attachAddon = new AttachAddon(ws);
terminal.loadAddon(attachAddon);
```

4. **When disconnecting:**
```typescript
// Dispose AttachAddon
attachAddon?.dispose();
attachAddon = null;

// Restore local handler
localModeDisposable = terminal.onData(...);
```

5. **Resize handling:**
- Send resize BEFORE loading AttachAddon
- OR use a side-band protocol (HTTP POST for resize)
- OR prefix control messages with a special byte sequence

## Key Insights

1. **AttachAddon is all-or-nothing** - it must have exclusive WebSocket control
2. **Multiple onData handlers cause conflicts** - only one should be active
3. **Mixing JSON and raw data is problematic** - need clear protocol separation
4. **The disposable pattern is crucial** - properly cleanup handlers when switching modes

