import { For, Dynamic } from 'solid-js/web';
import * as PhosphorIcons from 'phosphor-solid';
import { X } from 'phosphor-solid';
import linksConfig from '../config/links.json';

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
            <div class="avatar-placeholder">GT</div>
          </div>
          <p class="bio-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </section>

        {/* Social Links Section */}
        <section class="sidebar-section social-section">
          <h3 class="section-title">Connect</h3>
          <nav class="social-links">
            <For each={linksConfig.social}>
              {(link) => (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="social-link"
                  title={link.name}
                >
                  <span class="social-icon">
                    <Dynamic component={getIcon(link.icon)} size={20} weight="regular" />
                  </span>
                  <span class="social-label">
                    {link.username || link.name}
                  </span>
                </a>
              )}
            </For>
          </nav>
        </section>

        {/* Articles Section */}
        <section class="sidebar-section articles-section">
          <h3 class="section-title">Writing</h3>
          <a
            href={linksConfig.articles.url}
            target="_blank"
            rel="noopener noreferrer"
            class="articles-link"
          >
            <span class="articles-icon">
              <Dynamic component={getIcon(linksConfig.articles.icon)} size={22} weight="regular" />
            </span>
            <span class="articles-label">{linksConfig.articles.name}</span>
            <span class="articles-arrow">
              <PhosphorIcons.ArrowRight size={16} weight="bold" />
            </span>
          </a>
        </section>
      </div>
    </aside>
  );
};

export default Sidebar;
