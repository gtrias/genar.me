import { createSignal, For, Show } from 'solid-js';
import { projects, type BrandProjectKind } from '../brand/projects.js';
import { PHOSPHOR } from '../config/phosphor';
import { SCREEN_INSET } from '../config/screen';

// Headings for each kind, in the order projects.yaml first lists them
const KIND_TITLES: Record<BrandProjectKind, string> = {
  product: 'Apps',
  oss: 'Open source',
  writing: 'Writing',
};

const groups = [...new Set(projects.map((p) => p.kind))].map((kind) => ({
  kind,
  title: KIND_TITLES[kind],
  items: projects.filter((p) => p.kind === kind),
}));

// Open state shared with the panel's PROJECTS key. Closing hands focus back to whatever opened it.
const [open, setOpen] = createSignal(false);
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

/**
 * The project list shown on the glass in place of the terminal, for visitors who don't use a shell:
 * plain links in the phosphor colours, laid over the terminal's text area. The terminal keeps running
 * underneath and comes back on Esc or "Back to terminal".
 */
const ProjectsScreen = () => (
  <Show when={open()}>
    <section
      id="projects-screen"
      class="crt-projects"
      aria-labelledby="projects-title"
      style={{
        '--phosphor-bg': PHOSPHOR.background,
        '--phosphor-fg': PHOSPHOR.glass,
        '--phosphor-dim': PHOSPHOR.dim,
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        event.stopPropagation();
        closeProjects();
      }}
    >
      <div class="crt-projects-body" style={SCREEN_INSET}>
        <header class="crt-projects-header">
          <h2 id="projects-title" tabindex="-1" ref={(el) => queueMicrotask(() => el.focus())}>
            Projects
          </h2>
          <button type="button" class="crt-projects-back" onClick={closeProjects}>
            ‹ Back to terminal
          </button>
        </header>
        <For each={groups}>
          {(group) => (
            <section class="crt-projects-group" aria-label={group.title}>
              <h3>{group.title}</h3>
              <ul>
                <For each={group.items}>
                  {(project) => (
                    <li>
                      <a href={project.url} target="_blank" rel="noopener noreferrer">
                        {project.name}
                        <span aria-hidden="true"> ↗</span>
                      </a>
                      <p>{project.tagline}</p>
                    </li>
                  )}
                </For>
              </ul>
            </section>
          )}
        </For>
      </div>
    </section>
  </Show>
);

export default ProjectsScreen;
