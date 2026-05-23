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
    },
  });

  const stats = createStats({ userId });
  const cal = createCalendar({
    userId,
    onDayClick: (ds) => {
      datePicker.value = ds;
      tracker.loadForDate(ds);
      datePicker.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  });

  setupExport({
    userId,
    displayName: user.displayName || (userId === 'vivi' ? 'Vivi' : 'Vini'),
  });

  datePicker.addEventListener('change', () => {
    tracker.loadForDate(datePicker.value);
  });

  // Init
  Promise.all([
    tracker.loadForDate(datePicker.value),
    stats.render(),
    cal.render(),
  ]).finally(() => {
    document.body.classList.remove('is-loading');
  });
}
