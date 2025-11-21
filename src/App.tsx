import type { Component } from 'solid-js';
import Terminal from './components/Terminal';

const App: Component = () => {
  return (
    <div class="w-full h-screen bg-gray-900">
      <Terminal />
    </div>
  );
};

export default App;
