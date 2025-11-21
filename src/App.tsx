import type { Component } from 'solid-js';
import { createSignal, onMount, onCleanup, Show } from 'solid-js';
import Terminal from './components/Terminal';
import Sidebar from './components/Sidebar';

const App: Component = () => {
  const [viewportWidth, setViewportWidth] = createSignal(window.innerWidth);
  const [sidebarOpen, setSidebarOpen] = createSignal(
    localStorage.getItem('sidebarOpen') !== 'false' // Default open if not set or set to true
  );

  // Detect viewport width changes
  onMount(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    onCleanup(() => window.removeEventListener('resize', handleResize));
  });

  // Save sidebar state to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarOpen();
    setSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', String(newState));
  };

  // Determine if sidebar should be visible based on viewport and user preference
  const shouldShowSidebar = () => viewportWidth() >= 1360 && sidebarOpen();

  return (
    <div class="w-full h-screen flex overflow-hidden justify-center" style={{ background: '#2a2a2a' }}>
      {/* Terminal Container */}
      <div
        class="terminal-container flex-1 transition-all duration-300"
        style={{
          'max-width': '1360px',
        }}
      >
        <Terminal
          onToggleSidebar={toggleSidebar}
          sidebarVisible={shouldShowSidebar()}
        />
      </div>

      {/* Right Sidebar - only visible on wider screens */}
      <Show when={shouldShowSidebar()}>
        <Sidebar isOpen={sidebarOpen()} onClose={toggleSidebar} />
      </Show>
    </div>
  );
};

export default App;
