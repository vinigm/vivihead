// Calendário mensal. Suporta múltiplas instâncias via IDs configuráveis.

import { loadRange } from './storage.js';
import { todayISO, monthRange } from './utils.js';

const DOW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// ids = { calendar, label, prev, next }
// markGaps: destaca dias passados sem registro (útil pro modo retroativo)
// startDate: limita navegação/edição a datas >= este valor (opcional)
export function createCalendar({ userId, onDayClick, ids, markGaps = false, startDate = null }) {
  const calEl = document.getElementById(ids?.calendar || 'calendar');
  const labelEl = document.getElementById(ids?.label || 'cal-label');
  const btnPrev = document.getElementById(ids?.prev || 'cal-prev');
  const btnNext = document.getElementById(ids?.next || 'cal-next');

  const now = new Date();
  let viewYear = now.getFullYear();
  let viewMonth = now.getMonth();

  btnPrev.addEventListener('click', () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    render();
  });
  btnNext.addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    render();
  });

  // Permite trocar o mês exibido (ex: ao escolher uma data no date picker)
  function showMonthOf(dateStr) {
    if (!dateStr) return;
    const [y, m] = dateStr.split('-').map(Number);
    viewYear = y;
    viewMonth = m - 1;
    render();
  }

  async function render() {
    labelEl.textContent = `${MONTHS[viewMonth]} ${viewYear}`;
    calEl.innerHTML = '';

    DOW.forEach((d) => {
      const el = document.createElement('div');
      el.className = 'cal-dow';
      el.textContent = d;
      calEl.appendChild(el);
    });

    const { from, to } = monthRange(viewYear, viewMonth);
    const days = await loadRange(userId, from, to);
    const byDate = Object.fromEntries(days.map((d) => [d.date, d]));

    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startCol = firstDay.getDay();
    const today = todayISO();

    for (let i = 0; i < startCol; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      calEl.appendChild(empty);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const cell = document.createElement('div');
      cell.className = 'cal-day';
      cell.textContent = String(d);

      const entry = byDate[ds];
      const beforeStart = startDate && ds < startDate;

      if (entry) {
        if (entry.hadHeadache) cell.classList.add('pain');
        else cell.classList.add('clear');
      } else if (markGaps && ds <= today && !beforeStart) {
        // Dia passado sem registro — destaca como "buraco" pra preencher
        cell.classList.add('gap');
      }

      if (ds === today) cell.classList.add('today');
      if (ds > today || beforeStart) {
        cell.classList.add('future');
      } else {
        cell.addEventListener('click', () => onDayClick?.(ds));
      }
      calEl.appendChild(cell);
    }
  }

  return { render, showMonthOf };
}
