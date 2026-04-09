// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAcTGV1hE91bSYHWa_kQjaem8S7tUmyRis",
  authDomain: "wa-manager-e43e6.firebaseapp.com",
  projectId: "wa-manager-e43e6",
  storageBucket: "wa-manager-e43e6.firebasestorage.app",
  messagingSenderId: "872860342250",
  appId: "1:872860342250:web:9be4262873c1a57e68c493"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Habilitar persistencia offline (datos se guardan en el navegador)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Múltiples pestañas abiertas, persistencia offline no disponible');
  } else if (err.code === 'unimplemented') {
    console.warn('Navegador no soporta persistencia offline');
  }
});

export default app;
