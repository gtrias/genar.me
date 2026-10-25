/* @refresh reload */
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/barlow-semi-condensed/800.css';
import './index.css';
import '@xterm/xterm/css/xterm.css';
import { render } from 'solid-js/web';
import 'solid-devtools';

import App from './App';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <App />, root!);
