// Auth gate com whitelist de emails.

import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { auth, googleProvider } from './firebase-config.js';

export const AUTHORIZED_EMAILS = [
  'vinigm@gmail.com',
  'victoria.cerutti@gmail.com',
];

// Mapeia email autorizado para o userId que usamos como prefixo no Firestore.
export const EMAIL_TO_USER_ID = {
  'vinigm@gmail.com': 'vini',
  'victoria.cerutti@gmail.com': 'vivi',
};

export function userIdForEmail(email) {
  return EMAIL_TO_USER_ID[(email || '').toLowerCase()] || null;
}

export function setupAuthGate({ onAuthorized, onUnauthorized }) {
  const gate = document.getElementById('auth-gate');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const errEl = document.getElementById('auth-error');

  function showGate(errorMsg) {
    document.documentElement.classList.add('auth-hidden');
    gate.hidden = false;
    document.getElementById('page').hidden = true;
    if (errorMsg) {
      errEl.textContent = errorMsg;
      errEl.hidden = false;
    } else {
      errEl.hidden = true;
    }
  }

  function hideGate() {
    gate.hidden = true;
    document.documentElement.classList.remove('auth-hidden');
    document.getElementById('page').hidden = false;
  }

  btnLogin?.addEventListener('click', async () => {
    errEl.hidden = true;
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      if (
        e.code === 'auth/popup-blocked' ||
        e.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        errEl.textContent = 'Erro ao entrar: ' + (e.message || e.code);
        errEl.hidden = false;
      }
    }
  });

  btnLogout?.addEventListener('click', async () => {
    try { localStorage.removeItem('vh:lastUid'); } catch (_) {}
    await signOut(auth);
    location.reload();
  });

  // Trata retorno de redirect (fallback de popup bloqueado)
  getRedirectResult(auth)
    .then((r) => console.log('[ViviHead] getRedirectResult →', r))
    .catch((e) => console.error('[ViviHead] getRedirectResult ERROR', e));

  console.log('[ViviHead] setupAuthGate iniciado');

  onAuthStateChanged(auth, (user) => {
    console.log('[ViviHead] onAuthStateChanged →', user);
    if (!user) {
      console.log('[ViviHead] sem user → mostrando gate');
      showGate();
      onUnauthorized?.();
      return;
    }
    const email = (user.email || '').toLowerCase();
    console.log('[ViviHead] email =', email, '| autorizado:', AUTHORIZED_EMAILS.includes(email));
    if (!AUTHORIZED_EMAILS.includes(email)) {
      showGate('Email não autorizado: ' + email);
      signOut(auth);
      onUnauthorized?.();
      return;
    }
    try { localStorage.setItem('vh:lastUid', user.uid); } catch (_) {}
    console.log('[ViviHead] autorizado, chamando hideGate + onAuthorized');
    hideGate();
    onAuthorized?.({ user, userId: userIdForEmail(email) });
  });
}
