import { createSignal } from 'solid-js';
import { IDLE_MS, SCREENSAVERS, WAKE_GRACE_MS, type SaverName } from '../config/screensavers';
import { projectsOpen } from './projectsScreen';

// Which screensaver is on the glass, if any. Shared by the idle timer, the hidden command and the
// CRT view; kept here for the same hot-update reason as projectsScreen.
const [active, setActive] = createSignal<SaverName | null>(null);
export const activeScreensaver = active;

let lastPicked: SaverName | undefined;
let startedAt = 0;
let timer: number | undefined;
// Things that keep the idle timer from starting a screensaver: the paused terminal, a running command
const blockers = new Set<symbol>();

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const disarm = () => {
  window.clearTimeout(timer);
  timer = undefined;
};

const arm = () => {
  disarm();
  if (active() || document.hidden || reducedMotion()) return;
  timer = window.setTimeout(() => {
    if (reducedMotion()) return;
    if (blockers.size > 0 || projectsOpen()) arm();
    else startScreensaver();
  }, IDLE_MS);
};

/** Starts a screensaver: the named one, or a random one that isn't the last shown. */
export const startScreensaver = (name?: SaverName) => {
  const choices = SCREENSAVERS.filter((candidate) => candidate !== lastPicked);
  lastPicked = name ?? choices[Math.floor(Math.random() * choices.length)];
  startedAt = performance.now();
  disarm();
  setActive(lastPicked);
};

const stopScreensaver = () => {
  setActive(null);
  arm();
};

/** Keeps the idle timer from starting a screensaver until the returned release is called. */
export const blockScreensaver = (): (() => void) => {
  const token = Symbol();
  blockers.add(token);
  return () => {
    blockers.delete(token);
    arm();
  };
};

// Input that counts as activity, and wakes a running screensaver
const WAKE_EVENTS = ['keydown', 'pointerdown', 'touchstart'] as const;
// The rest of the wake input, swallowed once each so a wake never reaches the shell, a link or a key
const LEFTOVERS: Record<(typeof WAKE_EVENTS)[number], string[]> = {
  keydown: ['keypress', 'keyup'],
  pointerdown: ['mousedown', 'mouseup', 'pointerup', 'click'],
  touchstart: ['touchend', 'mousedown', 'mouseup', 'click'],
};
const SWALLOW_EVENTS = ['keypress', 'keyup', 'mousedown', 'mouseup', 'pointerup', 'touchend', 'click'] as const;
// An owed event that never comes (a key without a keypress) expires, so the next input is not eaten
const SWALLOW_MS = 700;

/**
 * Starts the idle timer and the wake handling. Returns the function that removes them.
 * The wake input is swallowed in the capture phase, before xterm or the panel see it.
 */
export const watchIdle = (): (() => void) => {
  let swallowUntil = 0;
  let owed = new Set<string>();

  const onWake = (event: Event) => {
    if (!active()) return;
    event.preventDefault();
    event.stopPropagation();
    if (performance.now() - startedAt < WAKE_GRACE_MS) return;
    swallowUntil = performance.now() + SWALLOW_MS;
    owed = new Set(LEFTOVERS[event.type as keyof typeof LEFTOVERS]);
    stopScreensaver();
  };
  const onSwallow = (event: Event) => {
    if (!active()) {
      if (performance.now() >= swallowUntil || !owed.delete(event.type)) return;
    }
    event.preventDefault();
    event.stopPropagation();
  };
  const onActivity = () => {
    if (!active()) arm();
  };
  const onVisibility = () => (document.hidden ? disarm() : arm());

  const options = { capture: true, passive: false } as const;
  for (const type of WAKE_EVENTS) window.addEventListener(type, onWake, options);
  for (const type of SWALLOW_EVENTS) window.addEventListener(type, onSwallow, options);
  for (const type of [...WAKE_EVENTS, 'wheel'] as const) window.addEventListener(type, onActivity, { capture: true, passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  arm();

  return () => {
    for (const type of WAKE_EVENTS) window.removeEventListener(type, onWake, options);
    for (const type of SWALLOW_EVENTS) window.removeEventListener(type, onSwallow, options);
    for (const type of [...WAKE_EVENTS, 'wheel'] as const) window.removeEventListener(type, onActivity, { capture: true });
    document.removeEventListener('visibilitychange', onVisibility);
    disarm();
  };
};
