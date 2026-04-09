// Firebase Configuration
// TODO: Reemplaza estos valores con tu configuración de Firebase
// Ve a https://console.firebase.google.com/ → Tu proyecto → Configuración del proyecto
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
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
