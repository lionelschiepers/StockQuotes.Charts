import { init, cleanup } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  init();
});

window.addEventListener('beforeunload', () => {
  cleanup();
});
