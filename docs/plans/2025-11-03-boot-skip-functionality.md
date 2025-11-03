# BIOS Boot Sequence Skip Functionality - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow users to skip the BIOS boot sequence by pressing any key, instantly jumping to the interactive terminal.

**Architecture:** Add keydown event listener during boot sequence that tracks and clears all setTimeout IDs, then immediately invokes the completion callback.

**Tech Stack:** JavaScript (Astro component script), xterm.js

---

## Task 1: Add Timeout Tracking Infrastructure

**Files:**
- Modify: `src/components/Terminal.astro:136-228` (runBIOSBootSequence function)

**Step 1: Add timeout tracking variables at start of runBIOSBootSequence**

Locate line 136 in `src/components/Terminal.astro` where `runBIOSBootSequence` function starts. Add timeout tracking variables immediately after the function declaration:

```javascript
function runBIOSBootSequence(terminal, callback) {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const typeDelay = isMobile ? 15 : 25; // Faster on mobile

  // Timeout tracking for skip functionality
  const timeoutIds = [];
  let bootSkipped = false;
```

**Step 2: Verify the change**

Run: `cat src/components/Terminal.astro | grep -A 8 "function runBIOSBootSequence"`

Expected: See the new timeout tracking variables after the isMobile and typeDelay declarations

**Step 3: Commit**

```bash
git add src/components/Terminal.astro
git commit -m "Add timeout tracking infrastructure for boot skip

Initialize timeoutIds array and bootSkipped flag to support
canceling boot sequence animations.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Add Skip Handler and Event Listener

**Files:**
- Modify: `src/components/Terminal.astro:136-228` (runBIOSBootSequence function)

**Step 1: Add skip handler function after timeout tracking variables**

Add the skip handler immediately after the `timeoutIds` and `bootSkipped` declarations:

```javascript
  // Timeout tracking for skip functionality
  const timeoutIds = [];
  let bootSkipped = false;

  // Skip handler - allows user to bypass boot sequence
  const skipHandler = () => {
    bootSkipped = true;

    // Clear all pending timeouts
    timeoutIds.forEach(id => clearTimeout(id));
    timeoutIds.length = 0;

    // Jump directly to interactive terminal
    terminal.clear();
    terminal.writeln('\x1b[96mWelcome to the Interactive Terminal!\x1b[0m');
    terminal.writeln('Type "help" for available commands.');
    terminal.writeln('');
    terminal.write(prompt);
    callback();
  };

  // Attach skip listener (auto-removes after first keypress)
  document.addEventListener('keydown', skipHandler, { once: true });
```

**Step 2: Verify the change**

Run: `grep -A 20 "Skip handler" src/components/Terminal.astro`

Expected: See the complete skip handler function and event listener registration

**Step 3: Commit**

```bash
git add src/components/Terminal.astro
git commit -m "Add skip handler with keydown event listener

Create skip handler that clears all pending timeouts and jumps
directly to interactive terminal. Use once:true for auto-cleanup.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Track Initial Boot Delay Timeout

**Files:**
- Modify: `src/components/Terminal.astro:224-227` (initial boot delay)

**Step 1: Modify initial boot delay to track timeout ID**

Locate the initial `setTimeout` at the bottom of `runBIOSBootSequence` (currently around line 225). Change from:

```javascript
// Start the boot sequence
setTimeout(() => {
  processNextMessage();
}, 500);
```

To:

```javascript
// Start the boot sequence
const initialTimeoutId = setTimeout(() => {
  processNextMessage();
}, 500);
timeoutIds.push(initialTimeoutId);
```

**Step 2: Verify the change**

Run: `grep -A 3 "Start the boot sequence" src/components/Terminal.astro`

Expected: See timeout ID being captured and pushed to timeoutIds array

**Step 3: Commit**

```bash
git add src/components/Terminal.astro
git commit -m "Track initial boot delay timeout for skip functionality

Capture setTimeout ID for initial 500ms delay so it can be
cleared if user skips the boot sequence.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Track Message Processing Timeouts

**Files:**
- Modify: `src/components/Terminal.astro:173-206` (processNextMessage function)

**Step 1: Track timeout in processNextMessage for message delays**

Locate the `setTimeout` inside `processNextMessage` (around line 187). Change from:

```javascript
setTimeout(() => {
  if (msg.text) {
    if (msg.instant) {
      terminal.writeln(`${msg.color}${msg.text}\x1b[0m`);
    } else {
      typeWriter(terminal, msg.text, msg.color, () => {
        terminal.writeln('');
        messageIndex++;
        processNextMessage();
      });
      return;
    }
  } else {
    terminal.writeln('');
  }

  messageIndex++;
  processNextMessage();
}, msg.delay);
```

To:

```javascript
const msgTimeoutId = setTimeout(() => {
  if (msg.text) {
    if (msg.instant) {
      terminal.writeln(`${msg.color}${msg.text}\x1b[0m`);
    } else {
      typeWriter(terminal, msg.text, msg.color, () => {
        terminal.writeln('');
        messageIndex++;
        processNextMessage();
      });
      return;
    }
  } else {
    terminal.writeln('');
  }

  messageIndex++;
  processNextMessage();
}, msg.delay);
timeoutIds.push(msgTimeoutId);
```

**Step 2: Verify the change**

Run: `grep -B 2 "timeoutIds.push(msgTimeoutId)" src/components/Terminal.astro`

Expected: See msgTimeoutId being captured and pushed to array

**Step 3: Commit**

```bash
git add src/components/Terminal.astro
git commit -m "Track message processing timeouts for skip functionality

Capture setTimeout IDs for all message delays so they can be
cleared if user skips the boot sequence.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Track Typewriter Character Timeouts

**Files:**
- Modify: `src/components/Terminal.astro:208-222` (typeWriter function)

**Step 1: Track timeout in typeChar nested function**

Locate the `setTimeout` inside the `typeChar` function (around line 215). Change from:

```javascript
function typeChar() {
  if (charIndex < text.length) {
    terminal.write(`${color}${text[charIndex]}\x1b[0m`);
    charIndex++;
    setTimeout(typeChar, typeDelay);
  } else {
    callback();
  }
}
```

To:

```javascript
function typeChar() {
  if (charIndex < text.length) {
    terminal.write(`${color}${text[charIndex]}\x1b[0m`);
    charIndex++;
    const charTimeoutId = setTimeout(typeChar, typeDelay);
    timeoutIds.push(charTimeoutId);
  } else {
    callback();
  }
}
```

**Step 2: Verify the change**

Run: `grep -A 2 "charTimeoutId" src/components/Terminal.astro`

Expected: See charTimeoutId being captured and pushed to timeoutIds array

**Step 3: Commit**

```bash
git add src/components/Terminal.astro
git commit -m "Track typewriter character timeouts for skip functionality

Capture setTimeout IDs for character-by-character animation delays
so they can be cleared if user skips during typewriter effect.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Add Cleanup on Natural Boot Completion

**Files:**
- Modify: `src/components/Terminal.astro:173-183` (processNextMessage completion)

**Step 1: Remove event listener when boot completes naturally**

Locate the completion check at the start of `processNextMessage` (around line 174). Change from:

```javascript
function processNextMessage() {
  if (messageIndex >= bootMessages.length) {
    // Clear screen and show welcome message
    terminal.clear();
    terminal.writeln('\x1b[96mWelcome to the Interactive Terminal!\x1b[0m');
    terminal.writeln('Type "help" for available commands.');
    terminal.writeln('');
    terminal.write(prompt);
    callback();
    return;
  }
```

To:

```javascript
function processNextMessage() {
  if (messageIndex >= bootMessages.length) {
    // Remove skip listener since boot completed naturally
    document.removeEventListener('keydown', skipHandler);

    // Clear screen and show welcome message
    terminal.clear();
    terminal.writeln('\x1b[96mWelcome to the Interactive Terminal!\x1b[0m');
    terminal.writeln('Type "help" for available commands.');
    terminal.writeln('');
    terminal.write(prompt);
    callback();
    return;
  }
```

**Step 2: Verify the change**

Run: `grep -A 10 "messageIndex >= bootMessages.length" src/components/Terminal.astro`

Expected: See event listener removal before terminal.clear()

**Step 3: Commit**

```bash
git add src/components/Terminal.astro
git commit -m "Remove skip listener on natural boot completion

Clean up keydown event listener when boot sequence completes
naturally to prevent listener from persisting unnecessarily.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Manual Testing

**Note:** This project has no automated tests. Manual testing is required.

**Step 1: Start development server**

Run: `npm run dev`

Expected: Dev server starts at http://localhost:4321

**Step 2: Test Case 1 - Skip during initial delay**

1. Open http://localhost:4321 in browser
2. Immediately press any key (within first 500ms)
3. Expected: Boot sequence stops, terminal shows "Welcome to the Interactive Terminal!" with prompt

**Step 3: Test Case 2 - Skip during first message**

1. Reload page
2. Wait for first boot message to appear ("BIOS v2.1.7")
3. Press any key
4. Expected: Boot sequence stops immediately, interactive terminal appears

**Step 4: Test Case 3 - Skip during typewriter effect**

1. Reload page
2. Wait for a message with typewriter animation
3. Press any key while characters are being typed
4. Expected: Typing stops immediately, interactive terminal appears

**Step 5: Test Case 4 - Natural completion without skip**

1. Reload page
2. Do NOT press any key
3. Wait for entire boot sequence to complete
4. Expected: Boot completes normally, interactive terminal appears after final message

**Step 6: Test Case 5 - Verify terminal is functional after skip**

1. Reload page
2. Press any key to skip
3. Type "help" and press Enter
4. Expected: Help command executes properly, shows command list

**Step 7: Test Case 6 - Mobile device testing**

1. Open http://localhost:4321 on mobile device or use browser dev tools mobile emulation
2. Press any key to skip
3. Expected: Skip works on mobile, terminal is functional

**Step 8: Check browser console for errors**

After each test case, check browser console (F12 → Console tab)

Expected: No JavaScript errors or warnings

**Step 9: Document test results**

Create a simple note of test results:

```bash
cat > docs/test-results-boot-skip.txt << 'EOF'
Boot Skip Functionality - Manual Test Results
Date: $(date +%Y-%m-%d)

TC1 - Skip during initial delay: PASS/FAIL
TC2 - Skip during first message: PASS/FAIL
TC3 - Skip during typewriter: PASS/FAIL
TC4 - Natural completion: PASS/FAIL
TC5 - Terminal functional after skip: PASS/FAIL
TC6 - Mobile device: PASS/FAIL
TC7 - Console errors: NONE/LIST

Notes:
[Any observations]
EOF
```

**Step 10: Commit test results**

```bash
git add docs/test-results-boot-skip.txt
git commit -m "Add manual test results for boot skip functionality

Document results of manual testing across different skip scenarios
and device types.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 8: Final Review and Cleanup

**Step 1: Review all changes**

Run: `git log --oneline -8`

Expected: See all 7 commits from this implementation

**Step 2: Review the diff**

Run: `git diff HEAD~7..HEAD src/components/Terminal.astro`

Expected: See all changes to Terminal.astro in one view

**Step 3: Verify no unintended changes**

Run: `git status`

Expected: Working directory clean, no uncommitted changes

**Step 4: Create summary of implementation**

Document what was implemented:

```bash
cat > docs/IMPLEMENTATION_SUMMARY.md << 'EOF'
# Boot Skip Functionality - Implementation Summary

## What Was Built
Users can now press any key during the BIOS boot sequence to instantly skip to the interactive terminal.

## Technical Approach
- Added timeout tracking array to capture all setTimeout IDs
- Created skip handler that clears all tracked timeouts
- Attached keydown event listener with `{ once: true }` for auto-cleanup
- Track timeouts in: initial delay, message processing, typewriter characters
- Clean up listener on natural boot completion

## Files Modified
- `src/components/Terminal.astro` - Added skip functionality to runBIOSBootSequence

## Testing
Manual testing completed across 6 test cases. See docs/test-results-boot-skip.txt

## Known Limitations
- Feature is intentionally hidden (no visual indicator)
- No persistence (boots every page load unless actively skipped)

## Future Enhancements
None planned - feature is complete as designed.
EOF
```

**Step 5: Commit summary**

```bash
git add docs/IMPLEMENTATION_SUMMARY.md
git commit -m "Add implementation summary for boot skip feature

Document the completed implementation, technical approach,
and testing results for future reference.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Success Criteria

✓ User can skip boot by pressing any key
✓ Skip is instant with no leftover animations
✓ No visual indicators (hidden feature)
✓ Terminal is fully functional after skip
✓ Works on desktop and mobile
✓ No console errors
✓ All changes committed with clear messages

## Notes

- This feature is intentionally undocumented in user-facing docs (hidden easter egg)
- The `{ once: true }` option on addEventListener automatically removes the listener after first keypress
- Manual removal on natural completion provides belt-and-suspenders safety
- All commits follow conventional commit format with Co-Authored-By attribution
