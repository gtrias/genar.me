import { For, Show, Dynamic } from 'solid-js/web';
import * as PhosphorIcons from 'phosphor-solid';
import { X } from 'phosphor-solid';
import { identity } from '../brand/identity.js';
import { socialLinks, writingLink } from '../config/links';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const Sidebar = (props: SidebarProps) => {
  // Helper to get the icon component from Phosphor
  const getIcon = (iconName: string) => {
    return (PhosphorIcons as any)[iconName] || PhosphorIcons.Circle;
  };

  return (
    <aside
      class="sidebar"
      classList={{ 'sidebar-open': props.isOpen }}
    >
      {/* Close button */}
      {props.onClose && (
        <button
          type="button"
          onClick={props.onClose}
          class="sidebar-close-button"
          title="Close sidebar"
        >
          <X size={20} weight="bold" />
        </button>
      )}
      <div class="sidebar-content">
        {/* Bio Section */}
        <section class="sidebar-section bio-section">
          <div class="bio-avatar">
            <img
              src="/genar-avatar.png"
              alt={identity.name}
              class="avatar-image"
            />
          </div>
          <p class="bio-text">{identity.bio.short}</p>
        </section>

        {/* Social Links Section */}
        <section class="sidebar-section social-section">
          <h3 class="section-title">Connect</h3>
          <nav class="social-links">
            <For each={socialLinks}>
              {(link) => (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="social-link"
                  title={link.label}
                >
                  <span class="social-icon">
                    <Dynamic component={getIcon(link.icon)} size={20} weight="regular" />
                  </span>
                  <span class="social-label">
                    {link.text}
                  </span>
                </a>
              )}
            </For>
          </nav>
        </section>

        {/* Articles Section */}
        <Show when={writingLink}>
          {(writing) => (
            <section class="sidebar-section articles-section">
              <h3 class="section-title">Writing</h3>
              <a
                href={writing().url}
                target="_blank"
                rel="noopener noreferrer"
                class="articles-link"
              >
                <span class="articles-icon">
                  <Dynamic component={getIcon(writing().icon)} size={22} weight="regular" />
                </span>
                <span class="articles-label">{writing().text}</span>
                <span class="articles-arrow">
                  <PhosphorIcons.ArrowRight size={16} weight="bold" />
                </span>
              </a>
            </section>
          )}
        </Show>
      </div>
    </aside>
  );
};

export default Sidebar;
