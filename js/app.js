// Bootstrap principal — orquestra auth + tracker + calendar + stats + export.

// import { setupAuthGate } from './auth.js';
import { createTracker } from './tracker.js';
import { createCalendar } from './calendar.js';
import { createStats } from './stats.js';
import { setupExport } from './export.js';
import { todayISO, APP_START_DATE } from './utils.js';

// MODO SEM AUTH (temporário) — pra testar o app sem login.
// Pra reativar auth: descomenta o import acima e troca este bloco pelo setupAuthGate original.
document.documentElement.classList.remove('auth-hidden');
document.getElementById('auth-gate').hidden = true;
document.getElementById('page').hidden = false;
document.getElementById('btn-logout').style.display = 'none';
bootstrap({ user: { displayName: 'Vivi' }, userId: 'vivi' });

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
