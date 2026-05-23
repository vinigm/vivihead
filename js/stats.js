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
  const elMeds = document.getElementById('stat-meds');

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

    // Aderência ao remédio — só conta dias que já passaram (não inclui hoje
    // se ainda não chegou na noite). Dia sem registro também conta como 0/3.
    const today = todayISO();
    const daysInRange = [];
    let cursor = from;
    while (cursor <= to && cursor <= today) {
      daysInRange.push(cursor);
      cursor = addDays(cursor, 1);
    }
    const dosesTotal = daysInRange.length * 3;
    const dosesTaken = daysInRange.reduce((sum, ds) => {
      const d = byDate[ds];
      return sum + (d && Array.isArray(d.meds) ? d.meds.length : 0);
    }, 0);
    if (dosesTotal === 0) {
      elMeds.textContent = '—';
    } else {
      const pct = Math.round((dosesTaken / dosesTotal) * 100);
      elMeds.textContent = `${dosesTaken}/${dosesTotal} (${pct}%)`;
    }

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
