# BIOS Boot Sequence Skip Functionality - Design Document

**Date:** 2025-11-03
**Status:** Approved

## Overview

Add the ability for users to skip the BIOS boot sequence by pressing any key during the animation, instantly jumping to the interactive terminal. This feature will be implemented as a hidden easter egg with no visual indicators.

## Requirements

### Functional Requirements
- **FR1:** User can press any key during boot sequence to skip it entirely
- **FR2:** Skip action instantly clears screen and shows interactive terminal prompt
- **FR3:** No visual indicator or hint about skip functionality (hidden feature)
- **FR4:** No persistence - boot sequence plays on every page load unless actively skipped

### Non-Functional Requirements
- **NFR1:** Skip must cancel all pending animations and timeouts
- **NFR2:** Implementation must handle edge cases (skip during typewriter, double events, etc.)
- **NFR3:** Must work on both desktop and mobile devices

## Architecture

### Core Components

1. **Event Listener Setup**
   - Attach keydown listener when `runBIOSBootSequence()` starts
   - Use `{ once: true }` option for automatic cleanup
   - Listener scope: entire document (not just terminal)

2. **Timeout Tracking System**
   - Store all `setTimeout` IDs in `timeoutIds` array
   - Track both message delays and typewriter character delays
   - Clear all on skip using `clearTimeout()`

3. **Skip Handler Function**
   - Set `bootSkipped` flag to prevent race conditions
   - Clear all tracked timeouts
   - Execute completion flow: clear screen, show welcome, invoke callback

4. **Cleanup Mechanism**
   - Remove event listener after natural boot completion
   - Remove event listener after skip (already handled by `once: true`)

## Implementation Strategy

### Timeout Tracking Pattern

**Current Code:**
```javascript
setTimeout(() => {
  // message processing
}, msg.delay);
```

**Modified Code:**
```javascript
const id = setTimeout(() => {
  // message processing
}, msg.delay);
timeoutIds.push(id);
```

This pattern applies to:
- Message delay timeouts in `processNextMessage()`
- Character delay timeouts in `typeWriter()` function
- Initial boot delay (500ms at sequence start)

### Skip Handler Implementation

```javascript
const timeoutIds = [];
let bootSkipped = false;

const skipHandler = () => {
  bootSkipped = true;

  // Clear all pending timeouts
  timeoutIds.forEach(id => clearTimeout(id));
  timeoutIds.length = 0;

  // Jump to completion
  terminal.clear();
  terminal.writeln('\x1b[96mWelcome to the Interactive Terminal!\x1b[0m');
  terminal.writeln('Type "help" for available commands.');
  terminal.writeln('');
  terminal.write(prompt);
  callback();
};

document.addEventListener('keydown', skipHandler, { once: true });
```

### Cleanup on Natural Completion

```javascript
function processNextMessage() {
  if (messageIndex >= bootMessages.length) {
    // Remove skip listener since boot completed naturally
    document.removeEventListener('keydown', skipHandler);

    // Continue with normal completion
    terminal.clear();
    // ... rest of completion code
  }
}
```

## Edge Cases

### 1. Skip During Typewriter Effect
**Scenario:** User presses key while character-by-character animation is running

**Solution:** Track typewriter timeouts in same `timeoutIds` array
```javascript
function typeChar() {
  if (charIndex < text.length) {
    terminal.write(`${color}${text[charIndex]}\x1b[0m`);
    charIndex++;
    const id = setTimeout(typeChar, typeDelay);
    timeoutIds.push(id);
  }
}
```

### 2. Double Event Listener Removal
**Scenario:** Both natural completion and `{ once: true }` try to remove listener

**Solution:** Use `{ once: true }` for skip case, manual removal for natural completion. Manual removal fails silently if already removed.

### 3. Skip Before First Timeout
**Scenario:** User presses key during initial 500ms delay

**Solution:** Skip handler works with empty or partially-filled `timeoutIds` array. Clearing empty array is safe operation.

### 4. Variable Scope Access
**Scenario:** Skip handler needs access to `terminal`, `callback`, and `prompt` variables

**Solution:** All variables declared in `runBIOSBootSequence` function scope, accessible to skip handler closure.

## Data Flow

### Normal Boot Flow
```
Start → Load commands → Run boot sequence →
Process messages (with delays) → Typewriter effects →
Clear screen → Show welcome → Invoke callback → Interactive terminal
```

### Skip Flow
```
Start → Load commands → Run boot sequence →
[User presses key] → Clear all timeouts →
Clear screen → Show welcome → Invoke callback → Interactive terminal
```

## Testing Considerations

### Manual Test Cases
1. **TC1:** Press key immediately after page load (during initial delay)
2. **TC2:** Press key during first boot message
3. **TC3:** Press key during typewriter effect
4. **TC4:** Press key during memory test progress bar
5. **TC5:** Let boot complete naturally without pressing key
6. **TC6:** Test on mobile device
7. **TC7:** Test with different key types (letter, arrow, spacebar, etc.)

### Expected Outcomes
- All test cases should result in clean interactive terminal
- No console errors
- No leftover animations or partially-displayed text
- Prompt should be functional immediately

## Implementation Files

**Primary File:**
- `src/components/Terminal.astro` - Contains `runBIOSBootSequence()` function

**Specific Functions to Modify:**
1. `runBIOSBootSequence()` - Add timeout tracking and skip handler
2. `processNextMessage()` - Track message delay timeouts, cleanup listener
3. `typeWriter()` - Track character delay timeouts

## Rollout Plan

1. Implement timeout tracking infrastructure
2. Add skip handler with event listener
3. Add cleanup logic for natural completion
4. Test all edge cases
5. Deploy with no announcement (hidden feature discovery)

## Success Criteria

- User can skip boot by pressing any key
- Skip is instant with no leftover animations
- Feature works on desktop and mobile
- No visual indicators present (pure hidden feature)
- No persistence across page loads
