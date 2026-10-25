import { createSignal } from 'solid-js';

// Whether the project list is showing on the glass, shared by the panel's PROJECTS key and the screen.
// It lives apart from both components so a hot update of either keeps one signal (a copy recreated
// inside a hot-updated component module would leave the key toggling a signal nobody renders).
const [open, setOpen] = createSignal(false);
// Closing hands focus back to whatever opened the list
let returnFocus: HTMLElement | null = null;

export const projectsOpen = open;

export const closeProjects = () => {
  if (!open()) return;
  setOpen(false);
  returnFocus?.focus();
  returnFocus = null;
};

export const toggleProjects = () => {
  if (open()) return closeProjects();
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  setOpen(true);
};
