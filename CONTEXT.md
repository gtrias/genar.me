# genar.me

A personal site presented as a 1979 green-phosphor console: a shell on the CRT glass, with a side panel of links and keys.

## Language

**Screensaver**:
A full-screen animation shown on the glass in place of the terminal. Three exist: starfield, bouncing logo, scope.
_Avoid_: Idle animation, screen blanker

**Idle**:
The state of a visitor who has given no input for 60 seconds. Idle starts a Screensaver.
_Avoid_: Inactive, AFK

**Wake input**:
Any key, click, touch or keypad press that ends a Screensaver. It is swallowed and never reaches the shell.
_Avoid_: Dismiss key

**Easter egg trigger**:
The undocumented `screensaver` command that starts a Screensaver on demand, bypassing Idle.
_Avoid_: Debug command
