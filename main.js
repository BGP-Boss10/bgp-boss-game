// Load → validate → start. Content errors stop the game before anything can be graded.
import { validateContent } from './engine/content.js';
import { createSession } from './engine/state.js';
import { contentErrorView, loadingView } from './ui/render.js';
import { bind, paint } from './ui/controls.js';

const app = {
  session: null,
  announced: null,
  lastKey: undefined,
  focusId: null,
  lastMove: null,
  reload: load,
};

function showStatic(node, focus) {
  app.session = null;
  document.getElementById('view').replaceChildren(node);
  document.getElementById('restart-button').disabled = true;
  if (focus) document.getElementById('view-heading').focus();
}

async function load() {
  const retrying = app.lastKey !== undefined;
  showStatic(loadingView(), false);
  let doc;
  try {
    const response = await fetch('./data/levels.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    doc = await response.json();
  } catch (error) {
    showStatic(contentErrorView([], `The ticket data could not be loaded (${error.message}). `
      + 'Serve the game over HTTP (see the README) and try again.'), retrying);
    app.lastKey = 'error';
    return;
  }
  const { ok, errors } = validateContent(doc);
  if (!ok) {
    showStatic(contentErrorView(errors), retrying);
    app.lastKey = 'error';
    return;
  }
  app.session = createSession(doc);
  app.announced = null;
  if (!retrying) app.lastKey = undefined;
  paint(app);
}

bind(app);
load();
