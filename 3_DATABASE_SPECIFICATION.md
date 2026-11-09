# 💾 ESPECIFICACIÓN DE BASE DE DATOS (DBS)
## Modelo de Datos Cloud Firestore · Instancia Autónoma Gastronómica
### Plantilla Base: "Bistró & Leña · Fuego Sagrado"

---

### Control del Documento
* **Código:** `ARS-SPEC-DBS-003`
* **Versión:** `1.2.0` (Alineado con Iteración 1: Colección `authorized_staff`, Google Auth Whitelist & Cero Hardcoding)
* **Estado:** Aprobado para Construcción
* **Fecha:** 2026-11-09
* **Autor:** Josué Caro (ARSIGEN SAS) & Antigravity Lead Architect
* **Trazabilidad:** Derivado de `ARS-SPEC-SRS-001` y `ARS-SPEC-SAS-002`
* **Diagrama ERD Detallado:** [DIAGRAM_ENTITY_RELATIONSHIP.md](file:///c:/Users/JOSUE/PROYECTOS/Plantilla%20Arsigen/DIAGRAM_ENTITY_RELATIONSHIP.md)

---

## 1. Visión General de la Base de Datos

El motor de ARSIGEN utiliza **Google Cloud Firestore** (modo nativo NoSQL) en cada proyecto individual de Firebase. La arquitectura de datos está diseñada para:
1. **Consumo Eficiente y Escalable:** Optimizado para la capa gratuita/económica de Firebase mediante consultas indexadas.
2. **Consultas en Tiempo Real de Baja Latencia:** Sincronización continua de mesas y comandas con listeners reactivos `onSnapshot`.
3. **Inmutabilidad Financiera:** Aplicación estricta de *Snapshotting* en órdenes pagadas (precios netos con IVA ya incluido, sin desglose impositivo).
4. **Control de Acceso Cerrado (Whitelist):** Modelo de personal basado en la colección segura `/authorized_staff`, donde cada usuario ingresa exclusivamente mediante Google OAuth.

---

## 2. Definición Detallada de Colecciones y Esquemas TypeScript

### 2.1. Colección `/config/general`
Documento singleton que define los parámetros operativos, la identidad del restaurante y el plan activo.

```ts
export interface RestaurantConfig {
  restaurantName: string;            // Ej: "Bistró & Leña · Fuego Sagrado"
  legalDocument: string;             // NIT o RUT (Ej: "901.482.119-3")
  address: string;                   // Dirección física para el pie del ticket
  phone: string;                     // Celular para contacto / pedidos
  currency: 'COP' | 'USD';           // Moneda de operación
  plan: 'start' | 'pro' | 'business';// Plan activo en la instancia (editable en vivo por el desarrollador)
  hasThematicDesign: boolean;        // true: Interfaz personalizada con motion de brasas y scroll lateral
  settings: {
    suggestedTipPercentage: number;  // Ej: 10 (propina voluntaria sugerida)
    receiptLegalLegend: string;      // "Comprobante de consumo interno / No válido como factura fiscal"
    orderConsecutiveDaily: number;   // Consecutivo numérico diario (reinicia a 1 a medianoche)
    consecutiveDate: string;         // YYYY-MM-DD para control del reinicio de consecutivo
  };
  socialLinks?: {                    // Bloqueado en Plan Start; disponible en Pro y Business
    whatsappUrl?: string;
    googleMapsReviewUrl?: string;
    instagramUrl?: string;
  };
  updatedAt: string;                 // ISO 8601 Timestamp
}
```

> **Aclaración de Impuestos:** Todos los precios del menú ya incluyen el IVA. El sistema erradica cualquier campo tipo `taxPercentage`, `pricesIncludeTax` o `taxAmount`. Este es un software operativo sin impacto tributario ni contable.

---

### 2.2. Colección `/categories`
Agrupadores del menú (Entradas, Platos Fuertes, Bebidas, etc.).

```ts
export interface MenuCategory {
  id: string;                        // Identificador único (auto-generado)
  name: string;                      // Nombre visual (Ej: "Cortes a la Brasa")
  iconSvgName: string;               // Nombre del icono SVG vectorial predefinido (Ej: "flame", "steak", "wine"). EMOJIS PROHIBIDOS.
  sortOrder: number;                 // Orden numérico interno de despliegue (Uso estrictamente interno, jamás visible al comensal)
  isActive: boolean;                 // Permite ocultar temporalmente una categoría entera
  createdAt: string;                 // ISO 8601 Timestamp
  updatedAt: string;                 // ISO 8601 Timestamp
}
```

---

### 2.3. Colección `/menu_items`
Catálogo vivo de productos. Tanto comensales como meseros consultan exactamente esta misma colección.

```ts
export interface MenuItem {
  id: string;                        // Identificador único
  categoryId: string;                // Referencia a /categories/{categoryId}
  name: string;                      // Nombre del producto (Ej: "Bife de Chorizo Angus 400g")
  description: string;               // Ingredientes y notas de cata
  price: number;                     // Precio vigente en moneda local con IVA incluido (Ej: 48000)
  imageUrl: string;                  // URL pública en Firebase Storage (o asset temático)
  imageStoragePath?: string;         // Ruta interna en Storage para borrado físico
  isAvailable: boolean;              // true: Disponible en carta | false: Agotado / Pausado
  sortOrder: number;                 // Orden numérico interno de visualización (Oculto al comensal)
  createdAt: string;                 // ISO 8601 Timestamp
  updatedAt: string;                 // ISO 8601 Timestamp
}
```

> **Aclaración de Minimalismo:** Se elimina por completo el campo `badgeTag`. La interfaz prescinde de etiquetas decorativas para mantener un diseño visual despejado, limpio y elegante.

---

### 2.4. Colección `/tables` (Plan Business)
Estado en tiempo real de cada mesa física del local (hasta 70 mesas).

```ts
export type TableStatus = 'vacia' | 'sin_imprimir' | 'ocupada';

export interface RestaurantTable {
  id: string;                        // Ej: "table_01", "table_02"
  number: number;                    // Número visible de la mesa (Ej: 1, 2, 3... 70)
  name: string;                      // Etiqueta (Ej: "Mesa 01", "Terraza 05")
  capacity: number;                  // Cantidad estimada de comensales (Ej: 4)
  status: TableStatus;               // Estado tripartito de caja
  activeOrderId: string | null;      // ID de la orden en curso (null si está vacía)
  currentWaiterId: string | null;    // ID/Email del mesero que abrió la mesa
  currentWaiterName: string | null;  // Nombre del mesero para visualización rápida
  openedAt: string | null;           // Momento en que se sentaron los comensales
  updatedAt: string;                 // Última mutación (ISO 8601)
}
```

#### Perspectivas de Interfaz:
* **Para el Mesero (Perspectiva Binaria):**
  * `vacia`: Botón **Verde (Disponible para sentar)**.
  * `sin_imprimir` u `ocupada`: Botón **Ámbar/Rojo (Ocupada con comanda activa)**.
* **Para el Administrador en Caja (Perspectiva Operativa):**
  * Visualiza los 3 estados: Verde (`vacia`), Ámbar Pulsante (`sin_imprimir`), Azul (`ocupada`).

---

### 2.5. Colección `/orders` (Plan Business)
Entidad central que modela la comanda para cocina, el recibo para el cliente y el histórico financiero inmutable.

```ts
export type OrderStatus = 'sin_imprimir' | 'impresa' | 'pagada' | 'cancelada';

export interface OrderItemSnapshot {
  productId: string;                 // ID del producto original (/menu_items/{id})
  productName: string;               // Snapshot del nombre al momento de la venta
  unitPrice: number;                 // Snapshot del precio neto con IVA incluido (INMUTABLE)
  quantity: number;                  // Cantidad solicitada (>= 1)
  subtotal: number;                  // unitPrice * quantity
  notes?: string;                    // Indicaciones especiales ("Término 3/4", "Sin sal")
  addedAt: string;                   // Timestamp ISO 8601 de cuándo se pidió este ítem
  isAddedRound: boolean;             // true si fue una adición posterior a la primera comanda despachada
}

export interface RestaurantOrder {
  id: string;                        // ID único de la orden
  dailyNumber: number;               // Consecutivo diario (Ej: #001, #002...)
  tableId: string;                   // Referencia a /tables/{id}
  tableNumber: number;               // Número de mesa (0 si es pedido personal de mesero)
  isWaiterPersonalOrder: boolean;    // true si fue pedido a nombre del personal
  waiterId: string;                  // Email/UID del mesero que tomó la orden
  waiterName: string;                // Nombre del mesero
  status: OrderStatus;               // 'sin_imprimir' | 'impresa' | 'pagada' | 'cancelada'
  
  items: OrderItemSnapshot[];        // Arreglo inmutable de platos solicitados
  
  // Resumen Financiero Libre de Impuestos (IVA ya incluido en unitPrice)
  subtotal: number;                  // Suma de todos los items[].subtotal
  tipAmount: number;                 // Propina voluntaria sugerida (10%)
  total: number;                     // subtotal + tipAmount
  
  // Auditoría y Despacho Temporal
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia' | null;
  createdAt: string;                 // Fecha y hora exacta de ENVÍO de la orden
  printedAt: string | null;          // Fecha y hora exacta de IMPRESIÓN de la comanda
  paidAt: string | null;             // Fecha y hora exacta de PAGO y cierre de la orden
  cancelledAt: string | null;        // Fecha y hora exacta de CANCELACIÓN
  cancellationReason?: string;       // Motivo obligatorio en caso de anulación por admin
}
```

> [!IMPORTANT]
> **Inmutabilidad Absoluta:** En el instante en que `status == 'pagada'`, este documento queda permanentemente congelado. Las reglas de seguridad bloquean cualquier operación de actualización o eliminación (`delete: false`).

---

### 2.6. Colección `/authorized_staff` (Seguridad y Control de Acceso Whitelist)
Reemplaza la gestión por PIN numérico compartida. Cada usuario de personal ingresa mediante su cuenta personal de Google OAuth.

```ts
export type StaffRole = 'developer' | 'admin' | 'waiter';

export interface AuthorizedStaff {
  email: string;                     // ID DEL DOCUMENTO: Correo personal de Google (Ej: usuario@gmail.com)
  role: StaffRole;                   // 'developer' | 'admin' | 'waiter'
  name: string;                      // Nombre operativo para turnos y comandas impresas
  active: boolean;                   // true: Acceso permitido | false: Acceso revocado
  assignedAt: string;                // ISO 8601 Timestamp de alta
  lastLoginAt: string | null;        // ISO 8601 Timestamp de última sesión
  currentSessionId?: string;         // Token para resguardo de sesión única concurrente
}
```

#### Reglas de Cardinalidad y Asignación de Roles:
* **Rol `developer`:** Superadministrador de infraestructura (Josué Caro). Cuenta con facultades de cambiar de plan y aprovisionar el restaurante.
* **Rol `admin`:** Exactamente **1 único usuario administrador** por restaurante.
* **Rol `waiter`:** **Ilimitados usuarios meseros**, cada uno con su cuenta individual de Google autenticada.

---

## 3. Índices Compuestos de Cloud Firestore (`firestore.indexes.json`)

```json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "paidAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "waiterId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "paidAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "menu_items",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "categoryId", "order": "ASCENDING" },
        { "fieldPath": "sortOrder", "order": "ASCENDING" }
      ]
    }
  ]
}
```
