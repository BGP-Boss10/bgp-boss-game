// Input events, painting, focus management, and the Restart dialog.
import { buildView, explanationContent, viewKey } from './render.js';
import {
  start, select, submit, help, next, nextHintLevel, currentRecord, currentRank,
  requestRestart, cancelRestart, confirmRestart,
} from '../engine/state.js';

/** Re-render the current view, keep or move focus deliberately, and update the live region. */
export function paint(app) {
  const s = app.session;
  const view = document.getElementById('view');
  const explanation = document.getElementById('explanation');
  const dialog = document.getElementById('restart-dialog');
  const activeId = document.activeElement && document.activeElement.id;

  if (s) document.getElementById('rank-title').textContent = currentRank(s);
  document.getElementById('restart-button').disabled = !s;

  view.replaceChildren(buildView(s));

  // Live region: replace contents only when there is a new result to announce.
  const result = s && s.view === 'round' ? s.lastResult : null;
  if (result !== app.announced) {
    explanation.replaceChildren(...explanationContent(s));
    app.announced = result;
  }

  // Restart dialog mirrors session.confirmingRestart. Handle it before focus, because
  // closing a modal dialog restores focus to whatever opened it.
  if (s && s.confirmingRestart && !dialog.open) dialog.showModal();
  if ((!s || !s.confirmingRestart) && dialog.open) dialog.close();

  // Focus: explicit request > new view heading > previously focused control.
  const key = viewKey(s);
  if (!dialog.open) {
    let target = null;
    if (app.focusId) target = document.getElementById(app.focusId);
    else if (app.lastKey !== undefined && key !== app.lastKey) target = document.getElementById('view-heading');
    else if (activeId) target = document.getElementById(activeId);
    if (target && !target.disabled) target.focus();
  }
  app.focusId = null;
  app.lastKey = key;
}

export function bind(app) {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    const s = app.session;
    if (action === 'retry-load') {
      app.reload();
      return;
    }
    if (!s) return;
    switch (action) {
      case 'start':
        start(s);
        break;
      case 'hint': {
        const level = nextHintLevel(s);
        if (level) help(s, level);
        app.focusId = 'help-heading';
        break;
      }
      case 'solution':
        help(s, 'solution');
        app.focusId = 'help-heading';
        break;
      case 'next':
        next(s);
        break;
      case 'restart':
        requestRestart(s);
        break;
      case 'restart-cancel':
        cancelRestart(s);
        app.focusId = 'restart-button';
        break;
      case 'restart-confirm':
        confirmRestart(s);
        app.lastKey = null; // always land on the first briefing's heading
        break;
      default:
        return;
    }
    paint(app);
  });

  document.addEventListener('change', (event) => {
    const input = event.target;
    if (!app.session || input.name !== 'choice') return;
    select(app.session, input.value);
    app.focusId = input.id;
    paint(app);
  });

  document.addEventListener('submit', (event) => {
    if (event.target.id !== 'answer-form') return;
    event.preventDefault();
    const s = app.session;
    if (!s) return;
    submit(s);
    // After a correct answer Submit becomes disabled, so move focus to Next.
    app.focusId = currentRecord(s).resolved ? 'next-button' : 'submit-button';
    paint(app);
  });

  // Escape on the native dialog fires "cancel": treat it as Cancel.
  document.getElementById('restart-dialog').addEventListener('cancel', (event) => {
    event.preventDefault();
    if (!app.session) return;
    cancelRestart(app.session);
    app.focusId = 'restart-button';
    paint(app);
  });
}
