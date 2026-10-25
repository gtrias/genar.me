import { For } from 'solid-js';
import { identity } from '../brand/identity.js';
import { socialLinks, writingLink } from '../config/links';
import { KEYPAD_EVENT } from '../config/keypad';

// Four keys, as in the approved design; the X/Twitter link stays out of the panel.
const buttons = [...socialLinks.filter((l) => l.id !== 'twitter'), ...(writingLink ? [writingLink] : [])];
const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Side panel bolted to the monitor: ID window with the avatar, one lit key per link, speaker grille and
// a keypad that types into the terminal.
const ControlPanel = () => (
  <aside class="console-panel" aria-label="Links">
    <div class="panel-plate panel-id">
      <div class="panel-window">
        <img src="/genar-avatar-4x.png" alt={identity.name} class="panel-avatar" width="256" height="256" />
      </div>
    </div>

    <nav class="panel-buttons">
      <For each={buttons}>
        {(link) => (
          <a href={link.url} target="_blank" rel="noopener noreferrer" class="panel-button">
            <span class="panel-lamp" aria-hidden="true" />
            <span class="panel-key">
              <span class="panel-label">{link.text}</span>
            </span>
          </a>
        )}
      </For>
    </nav>

    <div class="panel-plate panel-bottom">
      <div class="panel-speaker" aria-hidden="true" />
      <div class="panel-keypad" role="group" aria-label="Keypad: types into the terminal">
        <For each={DIGITS}>
          {(digit) => (
            <button
              type="button"
              class="keypad-key"
              onClick={() => window.dispatchEvent(new CustomEvent(KEYPAD_EVENT, { detail: digit }))}
            >
              {digit}
            </button>
          )}
        </For>
      </div>
    </div>
  </aside>
);

export default ControlPanel;
