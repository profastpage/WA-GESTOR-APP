# 🔐 Panel de Administración - Generador de Claves

## 📍 Acceso al Panel

Tu panel de administración está oculto. Para acceder:

```
https://wa-gestor-app.pages.dev/?admin=true
```

**Solo tú conoces este link.** Los clientes normales no lo ven.

---

## 🎯 Cómo Generar una Clave para un Cliente

### Opción 1: Clave Individual

1. Abre el panel admin: `https://wa-gestor-app.pages.dev/?admin=true`
2. Ingresa el **nombre del cliente** (ej: "Juan Pérez")
3. Ingresa el **teléfono** (opcional, ej: "987654321")
4. Haz clic en **"Generar Clave Única"**
5. Se genera algo como: `WA-QUF1IG4g-OTg3NjU0-ABCD-1A2B3C4D`
6. Copia la clave y envíala al cliente por WhatsApp

### Opción 2: Lote de Claves

1. En el panel admin, ve a **"Generar Lote de Claves"**
2. Elige la cantidad (1-50)
3. Haz clic en **"Generar X Claves"**
4. Copia todas las claves de una vez
5. Úsalas cuando los clientes vayan pagando

---

## 📋 Formato de las Claves

**Individual** (con nombre del cliente):
```
WA-[nombreHash]-[telHash]-[códigoAleatorio]-[timestamp]
Ej: WA-QUF1IG4g-OTg3NjU0-ABCD-1A2B3C4D
```

**Lote** (genéricas):
```
WA-PRO-[códigoAleatorio]-[timestamp]
Ej: WA-PRO-A1B2C3D4-1A2B3C4D
```

---

## 📱 Flujo Completo de Venta

### 1️⃣ Cliente prueba la app
- Entra a `https://wa-gestor-app.pages.dev/`
- Ve 3 clientes de ejemplo (María, Carlos, Ana)
- Todos los mensajes de demo van a **933 667 414** (tú)
- Puede probar todo pero no guardar

### 2️⃣ Cliente intenta guardar
- Hace clic en "+ Nuevo" o intenta editar
- Aparece modal: "🔓 Activa tu licencia"
- Ve opciones:
  - **"Activar por WhatsApp"** → te envía mensaje
  - **"Ya tengo mi código de activación"** → ingresa la clave

### 3️⃣ Tú recibes el mensaje
```
Hola, quiero activar mi licencia de WA Gestor
```

### 4️⃣ Le cobras S/120
- Yape: 933 667 414
- Plin: 933 667 414
- Transferencia

### 5️⃣ Generas la clave
- Abres: `https://wa-gestor-app.pages.dev/?admin=true`
- Generas clave con su nombre
- Le envías: "Tu código es: WA-XXXX-XXXX-XXXX-XXXX"

### 6️⃣ Cliente ingresa el código
- Va a "Ya tengo mi código de activación"
- Pega la clave
- Se activa automáticamente
- ¡Ahora tiene acceso completo!

---

## ✅ Qué pasa cuando se activa

- ✅ Puede agregar clientes ilimitados
- ✅ Puede crear plantillas ilimitadas
- ✅ Los mensajes van a SUS clientes (no a ti)
- ✅ Ve banner verde: "Licencia Completa Activada"
- ✅ Datos se guardan en su localStorage

---

## 🔒 Seguridad

- ✅ Cada clave es única y válida una sola vez
- ✅ Formato validado: WA-XXXX-XXXX-XXXX-XXXX
- ✅ Panel admin oculto (solo con ?admin=true)
- ✅ El cliente no puede ver tu panel
- ⚠️ Las claves están en el frontend (suficiente para MVP)

---

## 📊 Estadísticas que puedes trackear

- Cuántos abren el modal de activación
- Cuántos hacen clic en WhatsApp
- Cuántas claves has generado
- Cuántas se han activado
- Ingresos totales

---

## 🚀 Próximas Mejoras

- [ ] Backend para validación más segura
- [ ] Dashboard con métricas en tiempo real
- [ ] Desactivación remota de licencias
- [ ] Webhook de pago automático
- [ ] Múltiples planes (básico, premium)

---

## 📞 Soporte Técnico

Para cualquier duda, contáctame por WhatsApp: +51 933 667 414

---

## 🎁 Mensaje Sugerido para Enviar al Cliente

Después que pague:

```
✅ ¡Perfecto! Tu licencia de WA Gestor está lista.

Tu código de activación es:
WA-XXXX-XXXX-XXXX-XXXX

Para activar:
1️⃣ Abre WA Gestor
2️⃣ Ve a cualquier función bloqueada
3️⃣ Haz clic en "Ya tengo mi código"
4️⃣ Pega tu código y ¡listo!

Ahora tienes:
✓ Clientes ilimitados
✓ Plantillas ilimitadas  
✓ Soporte por WhatsApp

¡Cualquier duda estoy aquí! 🙌
```
