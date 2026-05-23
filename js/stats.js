// Estatísticas — calculadas em runtime a partir dos dias carregados.

import { loadRange } from './storage.js';
import { rangeFor, todayISO, addDays, APP_START_DATE } from './utils.js';

export function createStats({ userId }) {
  const sel = document.getElementById('stats-range');
  const elTotal = document.getElementById('stat-total');
  const elStreak = document.getElementById('stat-streak');
  const elMorning = document.getElementById('stat-morning');
  const elAfternoon = document.getElementById('stat-afternoon');
  const elEvening = document.getElementById('stat-evening');
  const elWaking = document.getElementById('stat-waking');
  const elAllDay = document.getElementById('stat-allday');

  sel.addEventListener('change', render);

  async function render() {
    const { from, to } = rangeFor(sel.value);
    const days = await loadRange(userId, from, to);
    const byDate = Object.fromEntries(days.map((d) => [d.date, d]));

    const painDays = days.filter((d) => d.hadHeadache);
    elTotal.textContent = String(painDays.length);

    const countStarted = (key) =>
      painDays.filter((d) => Array.isArray(d.startedAt) && d.startedAt.includes(key)).length;

    elWaking.textContent = String(countStarted('acordar'));
    elMorning.textContent = String(countStarted('manha') + countStarted('acordar'));
    elAfternoon.textContent = String(countStarted('tarde'));
    elEvening.textContent = String(countStarted('noite'));

    const allDay = painDays.filter((d) => Array.isArray(d.passedAt) && d.passedAt.includes('dia_todo')).length;
    elAllDay.textContent = String(allDay);

    // Streak de dias sem dor (a partir de hoje, indo pra trás).
    // "Sem registro hoje" não quebra a streak — usamos o último dia registrado.
    let streak = 0;
    let cursor = todayISO();
    while (cursor >= APP_START_DATE) {
      const d = byDate[cursor];
      if (d) {
        if (d.hadHeadache) break;
        streak++;
      }
      cursor = addDays(cursor, -1);
      // limite duro de 2 anos pra segurança
      if (streak > 730) break;
    }
    elStreak.textContent = String(streak);
  }

  return { render };
}
