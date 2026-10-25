import { For, Show } from 'solid-js';
import { projects, type BrandProjectKind } from '../brand/projects.js';
import { PHOSPHOR } from '../config/phosphor';
import { SCREEN_INSET } from '../config/screen';
import { closeProjects, projectsOpen } from '../state/projectsScreen';

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

// ASCII rules, longer than any screen is wide: CSS cuts them at the edge of the text area
const RULE = '─'.repeat(160);
const SEPARATOR = '┄'.repeat(160);

/**
 * The project list shown on the glass in place of the terminal, for visitors who don't use a shell:
 * plain links in the phosphor colours, laid over the terminal's text area. The terminal keeps running
 * underneath and comes back on Esc or "Back to terminal".
 */
const ProjectsScreen = () => (
  <Show when={projectsOpen()}>
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
              {/* "── APPS ─────": the rule runs to the edge and is cut there. No-break spaces, since
                  flex items drop their edge spaces */}
              <h3>
                <span aria-hidden="true">{'──\u00a0'}</span>
                {group.title}
                <span class="crt-projects-rule" aria-hidden="true">
                  {'\u00a0' + RULE}
                </span>
              </h3>
              <ul>
                <For each={group.items}>
                  {(project, i) => (
                    <li>
                      <Show when={i() > 0}>
                        <div class="crt-projects-sep" aria-hidden="true">
                          {SEPARATOR}
                        </div>
                      </Show>
                      <a href={project.url} target="_blank" rel="noopener noreferrer">
                        <span aria-hidden="true">› </span>
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
