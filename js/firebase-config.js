// Firebase config — preencher com as chaves do projeto vivihead-2ea23.
// Pegar em: https://console.firebase.google.com/u/0/project/vivihead-2ea23/settings/general
// > Seus apps > Configuração SDK > "Config"

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBeRECLkBxN4yXBucAaVZIP_8DaUSCULIk',
  authDomain: 'vivihead-2ea23.firebaseapp.com',
  projectId: 'vivihead-2ea23',
  storageBucket: 'vivihead-2ea23.firebasestorage.app',
  messagingSenderId: '631065819498',
  appId: '1:631065819498:web:44d01caaf0edc0a4718d13',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
