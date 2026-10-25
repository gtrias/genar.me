/* @refresh reload */
import '@fontsource/jetbrains-mono/300.css';
import '@fontsource/barlow-semi-condensed/600.css';
import '@fontsource/barlow-semi-condensed/800.css';
import './index.css';
import '@xterm/xterm/css/xterm.css';
import { render } from 'solid-js/web';
import 'solid-devtools';

import App from './App';
import { installDevicePixelShim } from './dev/devicePixelShim';

// Responsive mode in DevTools garbles the terminal without it; dropped from production builds
if (import.meta.env.DEV) installDevicePixelShim();

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <App />, root!);
