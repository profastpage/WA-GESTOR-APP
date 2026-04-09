# 📋 Instrucciones para Activar Licencias - WA Gestor

## 🎯 Flujo de Venta Actual

1. **Usuario prueba la app** con datos de ejemplo (modo demo)
2. **Intenta guardar/agregar/editar** → aparece modal de activación
3. **Hace clic en "Activar por WhatsApp"** → abre WhatsApp con mensaje pre-escrito
4. **Tú recibes el mensaje** en tu WhatsApp: +51 933 667 414
5. **Cliente paga S/120** por Yape, Plin o transferencia
6. **Tú activas la licencia** manualmente

---

## 🔑 Cómo Activar la Licencia del Cliente

### Opción 1: Activación Manual (Actual)
Cuando un cliente te paga, dile que haga esto:

1. Abre la consola del navegador (F12)
2. Escribe:
   ```javascript
   localStorage.setItem('wa_license_active', 'true');
   location.reload();
   ```
3. ¡Listo! La app se recarga con licencia completa

### Opción 2: Link de Activación (Recomendado)
Crea un link personalizado para cada cliente:

```
https://wa-gestor-app.pages.dev/activar?license=true
```

Luego necesitas agregar este código en `src/main.jsx`:

```javascript
// Después de los imports existentes
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('license') === 'true') {
  localStorage.setItem('wa_license_active', 'true');
  window.history.replaceState({}, document.title, window.location.pathname);
}
```

Envía este link al cliente después que pague.

---

## 💰 Métodos de Pago Sugeridos

### Para Perú:
- **Yape**: +51 933 667 414
- **Plin**: +51 933 667 414
- **Transferencia BCP/Interbank/BBVA**
- **MercadoPago** (opcional, si quieres automatizar)

### Precio:
- **S/120 soles** (pago único, sin mensualidades)

---

## 📱 Mensaje de WhatsApp que recibirás

Cuando un cliente haga clic en "Activar por WhatsApp", recibirás:

```
Hola, quiero activar mi licencia de WA Gestor
```

### Tu respuesta sugerida:
```
¡Hola! 👋 Perfecto, tu licencia de WA Gestor tiene un costo de S/120 (pago único, sin mensualidades).

Puedes pagar con:
✅ Yape: +51 933 667 414
✅ Plin: +51 933 667 414
✅ Transferencia bancaria (te envío los datos)

Una vez realizado el pago, te envío el link de activación. ¡En 5 minutos tendrás acceso completo! 🚀
```

---

## 🎁 Después del Pago

Envía al cliente:

1. **Link de activación** (si implementaste la Opción 2)
2. **O instrucciones** para activar manualmente (Opción 1)
3. **Mensaje de agradecimiento**:

```
✅ ¡Tu licencia está activada!

Ahora tienes acceso completo a:
✓ Clientes ilimitados
✓ Plantillas ilimitadas
✓ Guardar datos reales
✓ Soporte por WhatsApp

Cualquier duda, estoy aquí para ayudarte. 🙌
```

---

## 📊 Estadísticas que puedes trackear

- Cuántos abren el modal de activación
- Cuántos hacen clic en el link de WhatsApp
- Tasa de conversión a pago
- Ingresos totales

---

## 🚀 Mejoras Futuras

- [ ] Backend simple para activación automática
- [ ] Dashboard de administración
- [ ] Webhook de MercadoPago para pagos automáticos
- [ ] Múltiples planes (básico, premium, etc.)
- [ ] Sistema de referidos

---

## 📞 Soporte Técnico

Para cualquier duda o mejora, contáctame por WhatsApp al +51 933 667 414
