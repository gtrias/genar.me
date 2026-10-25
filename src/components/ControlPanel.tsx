import { For } from 'solid-js';
import { identity } from '../brand/identity.js';
import { socialLinks, writingLink } from '../config/links';

// Side panel bolted to the monitor: ID window with the avatar, one lit push-button per link, speaker grille.
const ControlPanel = () => {
  const buttons = [...socialLinks, ...(writingLink ? [writingLink] : [])];

  return (
    <aside class="console-panel" aria-label="Links">
      <div class="panel-plate panel-id">
        <img src="/genar-avatar-4x.png" alt={identity.name} class="panel-avatar" width="128" height="128" />
      </div>

      <nav class="panel-plate panel-buttons">
        <For each={buttons}>
          {(link) => (
            <a href={link.url} target="_blank" rel="noopener noreferrer" class="panel-button">
              <span class="panel-lamp" aria-hidden="true" />
              <span class="panel-label">{link.text}</span>
            </a>
          )}
        </For>
      </nav>

      <div class="panel-plate panel-speaker" aria-hidden="true" />
    </aside>
  );
};

export default ControlPanel;
