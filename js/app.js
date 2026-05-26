// Bootstrap principal — orquestra auth + tracker + calendar + stats + export.

import { setupAuthGate } from './auth.js';
import { createTracker } from './tracker.js';
import { createCalendar } from './calendar.js';
import { createStats } from './stats.js';
import { setupExport } from './export.js';
import { todayISO, APP_START_DATE } from './utils.js';

setupAuthGate({
  onAuthorized: ({ user, userId }) => {
    bootstrap({ user, userId });
  },
});

function bootstrap({ user, userId }) {
  // Registra service worker pra PWA.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  const datePicker = document.getElementById('date-picker');
  datePicker.min = APP_START_DATE;
  datePicker.max = todayISO();
  datePicker.value = todayISO();

  const tracker = createTracker({
    userId,
    getDate: () => datePicker.value,
    onSaved: () => {
      stats.render();
      cal.render();
      miniCal.render();
    },
  });

  const stats = createStats({ userId });

  // Ao clicar num dia (em qualquer calendário): carrega no tracker pra editar
  const goToDay = (ds) => {
    datePicker.value = ds;
    tracker.loadForDate(ds);
    miniCal.showMonthOf(ds);
    document.querySelector('.section-today').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Calendário completo (embaixo) — visão geral
  const cal = createCalendar({
    userId,
    onDayClick: goToDay,
  });

  // Mini-calendário (topo) — fluxo retroativo, destaca dias sem registro
  const miniCal = createCalendar({
    userId,
    onDayClick: goToDay,
    markGaps: true,
    startDate: APP_START_DATE,
    ids: { calendar: 'mini-calendar', label: 'mini-cal-label', prev: 'mini-cal-prev', next: 'mini-cal-next' },
  });

  setupExport({
    userId,
    displayName: user.displayName || (userId === 'vivi' ? 'Vivi' : 'Vini'),
  });

  datePicker.addEventListener('change', () => {
    tracker.loadForDate(datePicker.value);
    miniCal.showMonthOf(datePicker.value);
  });

  // Init
  Promise.all([
    tracker.loadForDate(datePicker.value),
    stats.render(),
    cal.render(),
    miniCal.render(),
  ]).finally(() => {
    document.body.classList.remove('is-loading');
  });
}
