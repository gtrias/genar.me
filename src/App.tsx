import type { Component } from 'solid-js';
import Terminal from './components/Terminal';
import ControlPanel from './components/ControlPanel';

// One device on a calm page: the monitor and its side panel share a single housing.
const App: Component = () => (
  <main class="page">
    <div class="console">
      <div class="console-monitor">
        <Terminal />
      </div>
      <ControlPanel />
    </div>
  </main>
);

export default App;
