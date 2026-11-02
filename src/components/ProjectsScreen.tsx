import { For, Show } from 'solid-js';
import { projects, type BrandProject, type BrandProjectKind } from '../brand/projects.js';
import { PHOSPHOR } from '../config/phosphor';
import { SCREEN_INSET } from '../config/screen';
import { SHELVES, SHOWCASE, type Shelf } from '../config/showcase';
import { closeProjects, projectsOpen } from '../state/projectsScreen';

// Headings for the kinds listed as plain text under the shelves
const KIND_TITLES: Record<Exclude<BrandProjectKind, 'product'>, string> = {
  oss: 'Open source',
  writing: 'Writing',
};

const shelfOf = (project: BrandProject): Shelf => SHOWCASE[project.id]?.shelf ?? 'apps';

// Products on picture shelves (games apart from apps), then the rest as text; each in the order
// projects.yaml first lists it
const products = projects.filter((p) => p.kind === 'product');
const shelves = [...new Set(products.map(shelfOf))].map((shelf) => ({
  shelf,
  ...SHELVES[shelf],
  items: products.filter((p) => shelfOf(p) === shelf),
}));
const lists = [...new Set(projects.map((p) => p.kind))]
  .filter((kind): kind is keyof typeof KIND_TITLES => kind !== 'product')
  .map((kind) => ({ title: KIND_TITLES[kind], items: projects.filter((p) => p.kind === kind) }));

// ASCII rules, longer than any screen is wide: CSS cuts them at the edge of the text area
const RULE = '─'.repeat(160);
const SEPARATOR = '┄'.repeat(160);

// "── APPS ─────": the rule runs to the edge and is cut there. No-break spaces, since flex items
// drop their edge spaces
const GroupTitle = (props: { title: string }) => (
  <h3>
    <span aria-hidden="true">{'──\u00a0'}</span>
    {props.title}
    <span class="crt-projects-rule" aria-hidden="true">
      {'\u00a0' + RULE}
    </span>
  </h3>
);

/**
 * The projects shown on the glass in place of the terminal, for visitors who don't use a shell: games
 * and apps as screenshots, phosphor-tinted until pointed at, each one a single link with its Play or
 * Try button; open source and writing as plain links below. The terminal keeps running underneath
 * and comes back on Esc or "Back to terminal".
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
        <For each={shelves}>
          {(group) => (
            <section class="crt-projects-group" aria-label={group.title}>
              <GroupTitle title={group.title} />
              <ul class="crt-projects-shelf">
                <For each={group.items}>
                  {(project) => (
                    <li>
                      <a class="crt-projects-card" href={project.url} target="_blank" rel="noopener noreferrer">
                        <span class="crt-projects-shot">
                          <Show when={SHOWCASE[project.id]}>
                            {(entry) => (
                              <img src={entry().shot} alt="" width="640" height="400" loading="lazy" decoding="async" />
                            )}
                          </Show>
                        </span>
                        <span class="crt-projects-name">{project.name}</span>
                        <span class="crt-projects-tagline">{project.tagline}</span>
                        <span class="crt-projects-action">
                          <span aria-hidden="true">▶ </span>
                          {group.action}
                        </span>
                      </a>
                    </li>
                  )}
                </For>
              </ul>
            </section>
          )}
        </For>
        <For each={lists}>
          {(group) => (
            <section class="crt-projects-group" aria-label={group.title}>
              <GroupTitle title={group.title} />
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
