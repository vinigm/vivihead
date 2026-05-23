// Lógica da seção "Hoje".

import { loadDay, saveDay } from './storage.js';

export function createTracker({ userId, getDate, onSaved }) {
  const hadGroup = document.getElementById('had-headache');
  const startedGroup = document.getElementById('started-at');
  const passedGroup = document.getElementById('passed-at');
  const detailsEl = document.getElementById('details');
  const notesEl = document.getElementById('notes');
  const btnSave = document.getElementById('btn-save');
  const status = document.getElementById('save-status');

  // Estado em memória
  let state = blankState();
  let original = blankState();

  function blankState() {
    return { hadHeadache: null, startedAt: [], passedAt: [], notes: '' };
  }

  function isEqual(a, b) {
    return (
      a.hadHeadache === b.hadHeadache &&
      a.notes === b.notes &&
      JSON.stringify([...a.startedAt].sort()) === JSON.stringify([...b.startedAt].sort()) &&
      JSON.stringify([...a.passedAt].sort()) === JSON.stringify([...b.passedAt].sort())
    );
  }

  function render() {
    // had headache
    hadGroup.querySelectorAll('.chip').forEach((c) => {
      const v = c.dataset.value;
      const active =
        (state.hadHeadache === true && v === 'sim') ||
        (state.hadHeadache === false && v === 'nao');
      c.classList.toggle('active', active);
    });
    detailsEl.hidden = state.hadHeadache !== true;

    startedGroup.querySelectorAll('.chip').forEach((c) => {
      c.classList.toggle('active', state.startedAt.includes(c.dataset.value));
    });
    passedGroup.querySelectorAll('.chip').forEach((c) => {
      c.classList.toggle('active', state.passedAt.includes(c.dataset.value));
    });
    notesEl.value = state.notes;
    updateSaveBtn();
  }

  function updateSaveBtn() {
    const dirty = !isEqual(state, original);
    btnSave.disabled = !dirty || state.hadHeadache === null;
    status.textContent = dirty ? 'Alterações não salvas' : '';
  }

  hadGroup.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const v = chip.dataset.value;
    state.hadHeadache = v === 'sim';
    if (!state.hadHeadache) {
      state.startedAt = [];
      state.passedAt = [];
    }
    render();
  });

  function toggleMultiSelect(group, field) {
    group.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      const v = chip.dataset.value;
      const arr = state[field];
      const idx = arr.indexOf(v);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(v);
      render();
    });
  }
  toggleMultiSelect(startedGroup, 'startedAt');
  toggleMultiSelect(passedGroup, 'passedAt');

  notesEl.addEventListener('input', () => {
    state.notes = notesEl.value;
    updateSaveBtn();
  });

  btnSave.addEventListener('click', async () => {
    btnSave.disabled = true;
    status.textContent = 'Salvando...';
    try {
      await saveDay(userId, getDate(), state);
      original = JSON.parse(JSON.stringify(state));
      status.textContent = 'Salvo ✓';
      setTimeout(() => { if (status.textContent === 'Salvo ✓') status.textContent = ''; }, 2000);
      onSaved?.(getDate());
    } catch (e) {
      status.textContent = 'Erro ao salvar: ' + (e.message || e.code);
    } finally {
      updateSaveBtn();
    }
  });

  async function loadForDate(dateStr) {
    state = blankState();
    original = blankState();
    render();
    const data = await loadDay(userId, dateStr);
    if (data) {
      state = {
        hadHeadache: data.hadHeadache === true ? true : data.hadHeadache === false ? false : null,
        startedAt: Array.isArray(data.startedAt) ? [...data.startedAt] : [],
        passedAt: Array.isArray(data.passedAt) ? [...data.passedAt] : [],
        notes: data.notes || '',
      };
      original = JSON.parse(JSON.stringify(state));
    }
    render();
  }

  return { loadForDate };
}
