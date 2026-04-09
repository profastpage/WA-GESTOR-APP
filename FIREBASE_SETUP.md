# 🔥 Configuración de Firebase para WA Manager CRM

## Paso 1: Crear proyecto en Firebase

1. Ve a https://console.firebase.google.com/
2. Haz clic en **"Agregar proyecto"**
3. Ponle un nombre (ej: `wa-manager-crm`)
4. Desactiva Google Analytics (opcional)
5. Haz clic en **"Crear proyecto"**

## Paso 2: Agregar una app web

1. En el panel del proyecto, haz clic en el ícono **web** `</>`
2. Registra la app con un nombre (ej: `WA Manager`)
3. **NO** actives Firebase Hosting
4. Copia la configuración que aparece

## Paso 3: Configurar el archivo firebase.js

Abre `src/firebase.js` y reemplaza los valores:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
```

## Paso 4: Habilitar Authentication

1. Ve a **Authentication** en el menú lateral
2. Haz clic en **"Comenzar"**
3. En la pestaña **"Sign-in method"**, habilita **Email/Contraseña**
4. Guarda los cambios

## Paso 5: Crear Firestore Database

1. Ve a **Firestore Database** en el menú lateral
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de prueba"** (luego puedes cambiar las reglas)
4. Elige una ubicación cercana a ti
5. Haz clic en **"Habilitar"**

## Paso 6: (Opcional) Configurar reglas de seguridad

Ve a Firestore → Reglas y usa:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo el dueño puede acceder a sus datos
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Paso 7: Deploy

Los cambios se suben automáticamente a GitHub y Cloudflare Pages los deploya.

¡Listo! Tu CRM está funcionando con base de datos en la nube 🎉
