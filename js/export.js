// Gera um relatório imprimível (window.print → "Salvar como PDF").

import { loadRange } from './storage.js';
import { rangeFor, formatBR, weekdayName, PERIOD_LABELS, PASSED_LABELS } from './utils.js';

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function rangeLabel(kind) {
  if (kind === 'month') return 'Este mês';
  if (kind === '30') return 'Últimos 30 dias';
  if (kind === '90') return 'Últimos 90 dias';
  return 'Todo o período';
}

export function setupExport({ userId, displayName }) {
  const btn = document.getElementById('btn-export');
  const sel = document.getElementById('export-range');

  btn.addEventListener('click', async () => {
    const kind = sel.value;
    const { from, to } = rangeFor(kind);
    const days = await loadRange(userId, from, to);
    const painDays = days.filter((d) => d.hadHeadache).sort((a, b) => a.date.localeCompare(b.date));
    const totalDays = painDays.length;

    const startedCount = { acordar: 0, manha: 0, tarde: 0, noite: 0 };
    const passedCount = { fim_manha: 0, tarde: 0, noite: 0, dia_todo: 0 };
    for (const d of painDays) {
      (d.startedAt || []).forEach((k) => { if (k in startedCount) startedCount[k]++; });
      (d.passedAt || []).forEach((k) => { if (k in passedCount) passedCount[k]++; });
    }

    const rows = painDays.map((d) => `
      <tr>
        <td>${escapeHtml(formatBR(d.date))}</td>
        <td>${escapeHtml(weekdayName(d.date))}</td>
        <td>${(d.startedAt || []).map((k) => escapeHtml(PERIOD_LABELS[k] || k)).join(', ') || '—'}</td>
        <td>${(d.passedAt || []).map((k) => escapeHtml(PASSED_LABELS[k] || k)).join(', ') || '—'}</td>
        <td>${escapeHtml(d.notes || '')}</td>
      </tr>
    `).join('');

    const html = `<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8" />
<title>Relatório de dor de cabeça — ${escapeHtml(displayName)}</title>
<style>
  body { font-family: -apple-system, 'Segoe UI', sans-serif; color: #222; margin: 24px; }
  h1 { margin: 0 0 4px; color: #d65a4d; }
  .sub { color: #666; margin-bottom: 24px; }
  .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
  .box { border: 1px solid #eee; border-radius: 8px; padding: 12px; }
  .box h3 { margin: 0 0 6px; font-size: 13px; text-transform: uppercase; color: #888; letter-spacing: 0.05em; }
  .box ul { margin: 0; padding-left: 18px; font-size: 14px; }
  .total { font-size: 32px; font-weight: 700; color: #d65a4d; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { border: 1px solid #eee; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #faf0ee; }
  @media print {
    body { margin: 12mm; }
    button { display: none; }
  }
  .print-btn { position: fixed; top: 20px; right: 20px; background: #e87b6f; color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
</style>
</head><body>
<button class="print-btn" onclick="window.print()">Imprimir / Salvar PDF</button>
<h1>Relatório de dor de cabeça</h1>
<div class="sub">${escapeHtml(displayName)} · ${escapeHtml(rangeLabel(kind))} · ${escapeHtml(formatBR(from))} a ${escapeHtml(formatBR(to))}</div>

<div class="summary">
  <div class="box">
    <h3>Dias com dor</h3>
    <div class="total">${totalDays}</div>
  </div>
  <div class="box">
    <h3>Início da dor</h3>
    <ul>
      <li>Ao acordar: <b>${startedCount.acordar}</b></li>
      <li>De manhã: <b>${startedCount.manha}</b></li>
      <li>À tarde: <b>${startedCount.tarde}</b></li>
      <li>À noite: <b>${startedCount.noite}</b></li>
    </ul>
  </div>
  <div class="box">
    <h3>Quando passou</h3>
    <ul>
      <li>No final da manhã: <b>${passedCount.fim_manha}</b></li>
      <li>À tarde: <b>${passedCount.tarde}</b></li>
      <li>À noite: <b>${passedCount.noite}</b></li>
      <li>Passou o dia todo com dor: <b>${passedCount.dia_todo}</b></li>
    </ul>
  </div>
</div>

<h2 style="margin-top: 8px;">Detalhamento dos dias</h2>
${totalDays === 0
  ? '<p style="color:#888">Nenhum dia com dor de cabeça registrado neste período.</p>'
  : `<table>
      <thead><tr><th>Data</th><th>Dia da semana</th><th>Quando sentiu</th><th>Quando passou</th><th>Observações</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`}
</body></html>`;

    const w = window.open('', '_blank');
    if (!w) {
      alert('Bloqueado pelo popup blocker. Permita popups deste site para abrir o relatório.');
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  });
}
