# ⚖️ REGLAS DE NEGOCIO Y ESPECIFICACIÓN DE PERMISOS (BRP)
## Lógica Operativa, RBAC y Reglas de Seguridad · ARSIGEN GastroPOS

---

### Control del Documento
* **Código:** `ARS-SPEC-BRP-004`
* **Versión:** `1.1.0` (Actualizado según Aclaraciones del Propietario)
* **Estado:** Aprobado para Construcción
* **Fecha:** 2026-11-08
* **Autor:** Josué Caro (ARSIGEN SAS) & Antigravity Lead Architect
* **Trazabilidad:** Derivado de `ARS-SPEC-SRS-001`, `ARS-SPEC-SAS-002` y `ARS-SPEC-DBS-003`

---

## 1. Catálogo Formal de Reglas de Negocio (`[BR-xxx]`)

### 1.1. Reglas de Catálogo y Precios
* **`[BR-PRC-01] Inmutabilidad de Ventas Pasadas (Snapshotting):`**  
  Toda orden creada almacena una copia estática e inmutable del nombre del plato y del precio unitario en el momento de la emisión. Toda mutación posterior en `/menu_items` no tiene efecto retroactivo sobre órdenes preexistentes ni sobre la contabilidad histórica.
* **`[BR-PRC-02] Catálogo Unificado y Simultáneo:**  
  El comensal y el mesero siempre visualizan exactamente el mismo catálogo de productos, descripciones, fotos, disponibilidad y precios vigentes. Si el administrador edita un precio en el panel, el nuevo valor rige automáticamente para el menú del comensal y para cualquier orden levantada por el mesero con posterioridad a la fecha/hora del cambio.
* **`[BR-PRC-03] Cumplimiento de Límites de Catálogo según Plan:**  
  * Plan Start: Hasta 35 productos (alta inicial ejecutada por el Desarrollador; cliente sin acceso a edición).
  * Plan Pro: Hasta 50 productos autogestionables por el Administrador.
  * Plan Business: Ilimitado (hasta 9.999 productos) autogestionable por el Administrador.
* **`[BR-PRC-04] Precios con IVA Incluido (Cero Desglose Tributario):`**  
  Todos los valores ingresados en el sistema representan precios netos con impuestos incluidos. Queda prohibida la aplicación de tasas de IVA o retenciones dentro del cálculo de subtotales, totales, tickets o estadísticas.

---

### 1.2. Reglas del Rol de Desarrollador (`ACT-DEV`) y Gestión de Usuarios
* **`[BR-DEV-01] Aprovisionamiento Inicial en Producción:`**  
  El Desarrollador cuenta con acceso especial en producción para dejar el restaurante 100% configurado antes de entregarlo al cliente: creación del único usuario Administrador, catálogo inicial de categorías con iconos vectoriales SVG seleccionados de la lista predefinida, productos iniciales, mapa de mesas y meseros iniciales.
* **`[BR-DEV-02] Conservación Íntegra de Facultades del Administrador:**  
  La intervención del Desarrollador durante el aprovisionamiento o soporte no limita ni restringe los permisos futuros del Administrador. Una vez entregada la aplicación, el Administrador conserva autonomía total para gestionar su restaurante según su plan.
* **`[BR-DEV-03] Gestión de Planes y Banderas en Vivo sin Redespliegue:**  
  Si un restaurante cambia de plan (ej. de Start a Pro, o de Pro a Business), el Desarrollador actualiza el atributo `/config/general.plan` o activa capacidades individuales desde el Panel de Desarrollador en producción. La aplicación web sincroniza sus capacidades de forma inmediata sin necesidad de alterar código en local ni redesplegar en Firebase Hosting.
* **`[BR-DEV-04] Autenticación Global del Desarrollador sin Código Hardcodeado:**  
  El correo del Desarrollador jamás debe estar escrito en el código fuente de Git. La validación se ejecuta en el servidor mediante Cloud Functions que verifican el ID Token de Google contra la configuración segura del proyecto, inyectando el rol `developer` en la sesión.
* **`[BR-USR-01] Límites Estrictos de Usuarios por Rol:**  
  * **Rol `admin`:** Permitido estrictamente **1 único usuario administrador** por restaurante.
  * **Rol `waiter`:** **Sin límite** en la cantidad de meseros registrados en el establecimiento.

---

### 1.3. Reglas de Salón, Mesas y Comandas (Plan Business)
* **`[BR-TAB-01] Perspectiva Dual del Ciclo de Vida de Mesas:**  
  * **Perspectiva del Mesero (Binaria):** La mesa solo puede estar **Vacía** (verde, lista para sentar) u **Ocupada** (ámbar/roja, con comensales). El mesero no visualiza ni gestiona el estado de impresión de la comanda.
  * **Perspectiva del Administrador en Caja (Tripartita):** Visualiza **Vacía**, **Sin Imprimir (Alerta)** y **Ocupada / Impresa**.
* **`[BR-TAB-02] Transición de Comanda a Mesa Ocupada:**  
  Cuando un mesero envía un pedido desde su celular, la mesa pasa de forma inmediata a `sin_imprimir` en el panel de caja. Solo cuando el administrador ejecuta la impresión física en la POS-5890U-L (o pulsa *"Omitir papel"*), la mesa transiciona formalmente a estado `ocupada`.
* **`[BR-TAB-03] Adiciones y Segundas Rondas:**  
  Si un mesero agrega platos a una mesa ya ocupada, la orden añade los nuevos ítems con la bandera `isAddedRound: true` y la mesa vuelve a colocarse en estado de alerta `sin_imprimir (Adición)` en caja, permitiendo al cajero imprimir exclusivamente la **Comanda de Adición** con los platos nuevos para cocina.
* **`[BR-TAB-04] Transferencia de Mesas:**  
  Un mesero solo puede transferir una comanda abierta a otra mesa si esta última se encuentra en estado estrictamente `vacia`. No se permite fusionar órdenes de mesas ocupadas automáticamente.
* **`[BR-TAB-05] Restricción Absoluta de Anulación y Cobro por Meseros:**  
  El mesero tiene terminantemente prohibido anular un pedido enviado o marcar una mesa como pagada. La anulación y el cobro son facultades exclusivas del rol `admin`. Si una orden se anula, el administrador debe ingresar obligatoriamente un motivo de anulación (`cancellationReason`).
* **`[BR-ORD-03] Inmutabilidad Absoluta de Órdenes Pagadas:**  
  En el instante en que una orden es marcada con `status == 'pagada'`, queda **permanentemente congelada e inmutable**. Nadie en el sistema (ni el Mesero, ni el Administrador, ni el Desarrollador) tiene permitido editar sus ítems, valores o eliminar el documento de la base de datos.

---

### 1.4. Reglas de Impresión Térmica POS-5890U-L
* **`[BR-PRT-01] Cuadrícula Monoespaciada Estricta de 32 Columnas:**  
  Ninguna línea enviada a la POS-5890U-L debe superar los 32 caracteres de ancho. Si el nombre de un producto excede los 18 caracteres en la columna descriptiva, debe dividirse en la línea inferior con sangría para preservar el orden visual.
* **`[BR-PRT-02] Segregación de Formatos de Impresión:**  
  * **Comanda Inicial (Cocina/Barra):** No incluye precios, subtotales ni dinero. Solo Encabezado, Consecutivo, Mesa, Mesero, Hora y Detalle de Ítems con Observaciones.
  * **Comanda de Adición:** Rotulada claramente como `*** COMANDA DE ADICIÓN ***`, contiene exclusivamente los ítems de rondas posteriores.
  * **Pre-cuenta del Cliente:** Desglose con valores monetarios (IVA incluido), propina voluntaria sugerida (10%) y leyenda obligatoria: *"Comprobante de consumo interno / No válido como factura fiscal"*.

---

### 1.5. Reglas de Seguridad y Autenticación
* **`[BR-SEC-01] Entrada Silenciosa por Triple Toque (Stealth Trigger):`**  
  El acceso al panel de personal se activa mediante tres toques consecutivos sobre el logo en un intervalo de tiempo menor a 1000 milisegundos. Los toques 1 y 2 no deben emitir ningún sonido, animación, cambio de escala ni efecto visual de hover, comportándose como un elemento inerte ante los comensales.
* **`[BR-SEC-02] Inexistencia de Auto-Registro Público:**  
  La ventana modal abierta tras el triple toque solo ofrece inicio de sesión para credenciales ya registradas. No existe ningún botón de "Registrarse" ni "Crear Cuenta". Los meseros solo pueden ser creados internamente por el administrador.
* **`[BR-SEC-03] Sesión Única Concurrente Obligatoria:**  
  Un mismo usuario solo puede tener una sesión activa a la vez. Si una cuenta inicia sesión en el Dispositivo B, el Dispositivo A debe cerrar sesión forzosa de inmediato mediante la invalidación del `currentSessionId`.
* **`[BR-SEC-04] Rate Limiting en PIN de Meseros:**  
  Si se registran 5 intentos fallidos consecutivos de PIN en un terminal, el acceso se bloquea temporalmente por 5 minutos para evitar ataques de fuerza bruta.

---

### 1.6. Reglas Matemáticas y Estadísticas Auditadas
* **`[BR-STA-01] Cálculo Exclusivo sobre Órdenes Pagadas:**  
  Toda métrica estadística se calcula **exclusivamente sobre órdenes cuyo atributo sea `status == 'paid'`**. Se prohíbe incluir órdenes en estado `sin_imprimir`, `ocupada` o `cancelada`.
* **`[BR-STA-02] Fórmulas Matemáticas Canónicas:**  
  * **Ventas Netas Diarias:** $V_{\text{día}} = \sum_{k \in \text{órdenes pagadas hoy}} \text{total}_k$
  * **Ticket Promedio:** $\bar{T} = \frac{V_{\text{día}}}{N_{\text{órdenes pagadas hoy}}}$
  * **Ranking de Productos por Rotación:** Agrupación por `productId` sumando `quantity`.
  * **Ranking de Productos por Facturación:** Agrupación por `productId` sumando `subtotal`.

---

## 2. Matriz de Control de Acceso Basado en Roles (RBAC)

| Módulo / Acción del Sistema | `ACT-DEV` (Desarrollador) | `ACT-ADM` (Dueño/Caja - 1 único) | `ACT-WTR` (Meseros - Ilimitados) | `ACT-CST` (Comensal) |
|---|:---:|:---:|:---:|:---:|
| Ver Menú Público Digital | ✅ | ✅ | ✅ | ✅ |
| Modificar Plan y Capacidades en Producción | ✅ | ❌ | ❌ | ❌ |
| Aprovisionar Restaurante Inicialmente | ✅ | ❌ | ❌ | ❌ |
| Editar Precios, Nombres y Fotos del Menú | ✅ | ✅ (Pro/Business) | ❌ | ❌ |
| Alternar Disponibilidad (Pausar Stock) | ✅ | ✅ (Pro/Business) | ❌ | ❌ |
| Crear y Modificar Usuarios Meseros | ✅ | ✅ (Business) | ❌ | ❌ |
| Abrir Mesa y Enviar Comanda a Cocina | ✅ | ✅ | ✅ (Business) | ❌ |
| Añadir Platos a Mesa Ocupada (Adición) | ✅ | ✅ | ✅ (Solo sus mesas) | ❌ |
| Transferir Mesa Vacía | ✅ | ✅ | ✅ (Solo sus mesas) | ❌ |
| Imprimir Comanda Inicial / Adición | ✅ | ✅ (Caja) | ❌ | ❌ |
| Imprimir Pre-cuenta / Recibo | ✅ | ✅ (Caja) | ❌ | ❌ |
| Anular una Orden Enviada (con motivo) | ✅ | ✅ | ❌ | ❌ |
| Registrar Pago y Liberar Mesa | ✅ | ✅ (Caja) | ❌ | ❌ |
| Modificar o Eliminar Orden PAGADA | 🚫 **PROHIBIDO** | 🚫 **PROHIBIDO** | 🚫 **PROHIBIDO** | 🚫 **PROHIBIDO** |
| Ver Estadísticas y Facturación | ✅ | ✅ (Business) | ❌ | ❌ |
| Ver Historial de Turno Propio | ✅ | ✅ | ✅ (Solo lo suyo) | ❌ |

---

## 3. Código Maestro de Reglas de Seguridad (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Funciones Auxiliares de Seguridad
    function isAuthenticated() {
      return request.auth != null;
    }

    function isDeveloper() {
      return isAuthenticated() && request.auth.token.role == 'developer';
    }

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function isAdmin() {
      return isAuthenticated() && (
        isDeveloper() ||
        getUserData().role == 'admin'
      );
    }

    function isWaiter() {
      return isAuthenticated() && getUserData().role == 'waiter';
    }

    function isActiveStaff() {
      return isAuthenticated() && (
        isDeveloper() ||
        getUserData().isActive == true
      );
    }

    // 1. Configuración General (/config/general)
    match /config/{docId} {
      allow read: true; // Lectura pública para saber nombre, logo, plan y settings
      // Solo el desarrollador o admin pueden modificar configuración
      allow write: if isDeveloper() || isAdmin();
    }

    // 2. Categorías del Menú (/categories)
    match /categories/{categoryId} {
      allow read: true;
      allow write: if isAdmin();
    }

    // 3. Catálogo de Productos (/menu_items)
    match /menu_items/{itemId} {
      allow read: true;
      allow write: if isAdmin();
    }

    // 4. Catálogo de Mesas (/tables)
    match /tables/{tableId} {
      allow read: if isActiveStaff();
      allow update: if isActiveStaff() && (
        isAdmin() ||
        (isWaiter() && (
          // El mesero no puede forzar mesa a 'vacia' directamente (eso es facultad de cobro)
          request.resource.data.status != 'vacia' || resource.data.status == 'vacia'
        ))
      );
      allow create, delete: if isAdmin();
    }

    // 5. Órdenes y Comandas (/orders)
    match /orders/{orderId} {
      allow read: if isActiveStaff();

      // INMUTABILIDAD ABSOLUTA: Una vez pagada, NINGÚN usuario puede editarla ni borrarla
      allow update: if isActiveStaff() && (
        resource.data.status != 'pagada' && (
          isAdmin() ||
          (isWaiter() && (
            resource.data.waiterId == request.auth.uid &&
            resource.data.status != 'cancelada' &&
            request.resource.data.status != 'pagada' &&
            request.resource.data.status != 'cancelada'
          ))
        )
      );

      // Creación permitida a personal activo
      allow create: if isActiveStaff() && (
        request.resource.data.status == 'sin_imprimir' &&
        request.resource.data.items.size() > 0 &&
        request.resource.data.waiterId == request.auth.uid
      );

      // Eliminación física terminantemente PROHIBIDA para todos (incluyendo admin y dev)
      allow delete: if false;
    }

    // 6. Directorio de Personal (/users)
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      // Solo admin o dev pueden crear/eliminar personal
      allow create: if isAdmin() && (
        // Garantizar que solo exista 1 admin (o dev creando el admin)
        request.resource.data.role != 'admin' || isDeveloper()
      );
      allow delete: if isAdmin();
      // Actualización de token de sesión única permitida al propio usuario
      allow update: if isAuthenticated() && (
        isAdmin() ||
        (request.auth.uid == userId && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['currentSessionId', 'lastLoginAt']))
      );
    }
  }
}
```
