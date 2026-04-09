# 🚀 Configuración de Pagos - WA Manager

## 📋 Pasos para activar los cobros

### 1️⃣ Crear cuenta en MercadoPago

1. Ve a [mercadopago.com.pe](https://www.mercadopago.com.pe)
2. Crea tu cuenta (gratis)
3. Verifica tu identidad con DNI

### 2️⃣ Crear Link de Pago

1. Entra a tu dashboard de MercadoPago
2. Ve a **"Link de pago"** en el menú lateral
3. Clic en **"Crear nuevo"**
4. Configura:
   - **Título**: `WA Manager - Licencia Pro`
   - **Precio**: `S/99`
   - **Descripción**: `Licencia de por vida para WA Manager Pro. Clientes ilimitados, plantillas ilimitadas y soporte prioritario.`
   - **Categoría**: Software/Servicios

5. Copia el link que te dan (será algo como `https://mpago.la/2XxYzAb`)

### 3️⃣ Actualizar el código

Abre el archivo `src/components/Pricing.jsx` y busca esta línea (aproximadamente línea 14):

```javascript
window.open('https://mpago.la/TU_LINK_DE_PAGO', '_blank');
```

Reemplaza `https://mpago.la/TU_LINK_DE_PAGO` con tu link real de MercadoPago.

### 4️⃣ Generar Claves de Licencia

La clave de licencia actual es: `WA-PRO-2026-X7K9`

Para cambiarla o generar nuevas claves:

1. Abre `src/hooks/useProLicense.js`
2. Busca la línea:
   ```javascript
   const PRO_LICENSE_KEY = 'WA-PRO-2026-X7K9';
   ```
3. Cambia la clave por la que quieras

**💡 Tip**: Puedes crear múltiples claves para diferentes clientes:

```javascript
const VALID_LICENSE_KEYS = [
  'WA-PRO-2026-X7K9',
  'WA-PRO-2026-A1B2',
  'WA-PRO-2026-C3D4',
];
```

Y luego en la función `activateKey`:

```javascript
if (VALID_LICENSE_KEYS.includes(inputKey.trim())) {
  // activar
}
```

### 5️⃣ Proceso de Venta Manual (por ahora)

1. **Cliente hace clic** en "Pagar con MercadoPago"
2. **Completa el pago** con Yape, Plin o tarjeta
3. **Tú recibes** la notificación de MercadoPago
4. **Envías** la clave de licencia por WhatsApp o email al cliente
5. **Cliente ingresa** la clave en la app y ¡listo!

---

## 🎯 Mejoras Futuras (con Backend)

- ✅ Verificación automática de pagos (webhook de MercadoPago)
- ✅ Generación automática de claves
- ✅ Dashboard de administrador
- ✅ Múltiples planes y precios
- ✅ Renovación de licencias
- ✅ Soporte por email integrado

---

## 📊 Métricas que puedes trackear

En MercadoPago puedes ver:
- Cuántos hicieron clic en el link
- Cuántos completaron el pago
- Tasa de conversión
- Ingresos totales

---

## 🆘 Soporte

Si tienes dudas sobre la configuración, contáctame por WhatsApp.
