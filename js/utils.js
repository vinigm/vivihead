// Helpers compartilhados.

export const APP_START_DATE = '2026-05-01';

export function todayISO(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return todayISO(dt);
}

export function parseISO(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function monthRange(year, monthIdx) {
  const first = new Date(year, monthIdx, 1);
  const last = new Date(year, monthIdx + 1, 0);
  return { from: todayISO(first), to: todayISO(last) };
}

export function rangeFor(kind) {
  const today = todayISO();
  if (kind === 'month') {
    const now = new Date();
    return monthRange(now.getFullYear(), now.getMonth());
  }
  if (kind === '30') return { from: addDays(today, -29), to: today };
  if (kind === '90') return { from: addDays(today, -89), to: today };
  if (kind === 'all') return { from: APP_START_DATE, to: today };
  return monthRange(new Date().getFullYear(), new Date().getMonth());
}

export function formatBR(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export const WEEKDAYS_FULL = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado',
];

export function weekdayName(dateStr) {
  return WEEKDAYS_FULL[parseISO(dateStr).getDay()];
}

export const PERIOD_LABELS = {
  acordar: 'Ao acordar',
  manha: 'De manhã',
  tarde: 'À tarde',
  noite: 'À noite',
};

export const PASSED_LABELS = {
  fim_manha: 'No final da manhã',
  tarde: 'À tarde',
  noite: 'À noite',
  dia_todo: 'Passei o dia todo com dor',
};

export const MED_LABELS = {
  manha: 'Manhã (8h)',
  tarde: 'Tarde (16h)',
  noite: 'Noite (23h)',
};

export const MED_SLOTS = ['manha', 'tarde', 'noite'];
