# 📋 ESPECIFICACIÓN DE REQUISITOS DE SOFTWARE (SRS)
## Ecosistema Gastronómico ARSIGEN · Suites Start, Pro & Business
### Plantilla Base: "Bistró & Leña · Fuego Sagrado"

---

### Control del Documento
* **Código:** `ARS-SPEC-SRS-001`
* **Versión:** `1.2.0` (Alineado con Iteración 1: Software Cerrado, Auth Google Whitelist & Experiencia Premium)
* **Estado:** Aprobado para Construcción
* **Fecha:** 2026-11-09
* **Autor:** Josué Caro (ARSIGEN SAS) & Antigravity Lead Architect
* **Metodología:** Spec-Driven Development (SDD) con GitHub Spec Kit

---

## 1. Introducción y Filosofía del Producto

### 1.1. Propósito
El propósito de este documento es especificar de manera formal, determinista y exhaustiva los requisitos funcionales, no funcionales, de interfaz y de seguridad del ecosistema gastronómico **ARSIGEN GastroPOS**. Este sistema digitaliza la carta interactiva, la toma de comandas en salón, el despacho en tiempo real a cocina/barra, la impresión térmica en caja y la auditoría estadística de ventas.

### 1.2. Naturaleza de Software Cerrado (Non-SaaS Público)
A diferencia de un SaaS abierto tradicional, la aplicación opera como un **software operativo privado e independiente por establecimiento**:
1. **Público General / Comensales:** Al escanear el código QR de una mesa o ingresar a la URL del restaurante, la aplicación actúa **estricta y exclusivamente como la carta digital interactiva**. No existe ningún botón de "Registrarse", "Iniciar sesión", selectores de suscripción ni pestañas visibles hacia módulos de administración o caja.
2. **Personal Operativo (Staff):** Los módulos internos (Salón, Cocina, Caja, Administración y Consola de Desarrollador) son completamente invisibles para el público general. El acceso se realiza mediante autenticación con **Google OAuth utilizando cuentas Gmail previamente autorizadas en la base de datos**.
3. **Desacoplamiento de Marca (Restaurante vs Desarrollador):** El front-end del menú pertenece íntegramente a la identidad visual del restaurante cliente (en esta plantilla base: *"Bistró & Leña · Fuego Sagrado"*). **ARSIGEN** es el proveedor tecnológico y su presencia se limita a una firma sobria, elegante y minimalista en el pie de página de la carta.

---

## 2. Actores y Perfiles del Sistema

| ID de Actor | Nombre del Rol | Descripción, Ámbito y Método de Acceso |
|---|---|---|
| **`ACT-DEV`** | **Desarrollador (ARSIGEN)** | Administrador global de infraestructura y aprovisionamiento. Acceso validado vía Google OAuth contra lista segura en Firestore/Cloud Functions. Concede o revoca acceso al administrador y meseros, conmuta planes en vivo (`start` $\leftrightarrow$ `pro` $\leftrightarrow$ `business`) sin redespliegue y cuenta con todas las facultades del Administrador. |
| **`ACT-ADM`** | **Administrador / Dueño** | Propietario o encargado del establecimiento (**exactamente 1 usuario por restaurante**). Acceso vía Google OAuth. En planes Pro y Business gestiona platos, fotos y precios; en Plan Business gestiona personal de meseros, atiende caja, emite comandas térmicas (POS-5890U-L), cobra mesas y analiza métricas de venta. |
| **`ACT-WTR`** | **Mesero / Personal de Salón** | Operador de salón en celulares o tablets (**sin límite en la cantidad de meseros**). Acceso mediante **Google OAuth con su correo personal pre-autorizado** (se erradican los PINs compartidos). Visualiza el mapa de mesas, registra comandas en 3 espacios ergonómicos, despacha rondas a cocina y gestiona transferencias. Prohibido cobrar o anular órdenes. |
| **`ACT-CST`** | **Comensal / Cliente** | Visitante presencial o remoto (sin autenticación). Consulta la carta digital interactiva, categorías, precios e ingredientes en tiempo real con experiencia visual inmersiva. No tiene acceso a ningún control operativo. |

---

## 3. Identidad Visual y Experiencia de Usuario Premium ("Bistró & Leña")

### 3.1. Concepto Gastronómico de la Plantilla Base
* **Nombre del Local:** **Bistró & Leña · Fuego Sagrado**
* **Línea Culinaria:** Carnes maduradas a la brasa, pizzas artesanales en horno de leña, ahumados rústicos y coctelería botánica.
* **Paleta Cromática de Alto Impacto:**
  * Fondo atmosférico: Carbón obsidiana (`#0b0f19` y `#0d1117`).
  * Resplandor de brasas: Ámbar fuego (`#f59e0b`), Cobre fundido (`#ea580c`) y Terracota profunda (`#9a3412`).
  * Toques frescos: Verde salvia / Romero silvestre (`#10b981`).
* **Layout Editorial Orgánico (Cero Encapsulado Cuadrado):**
  * Se prohíbe el uso de tarjetas cuadradas monótonas tipo "cajas de catálogo".
  * Los platos se presentan con tipografía editorial estilizada, fotografía gastronómica con recorte suave, gradientes ambientales con desenfoque Gaussiano (*blurred glow*) y metadatos integrados orgánicamente (precio destacado, gramaje, notas del chef).
* **Dirección de Arte y Motion Graphics:**
  * **Scroll Lateral Cinematográfico:** Barra horizontal continua para selección de categorías y carrusel de cortes recomendados con física de deslizamiento inercial suave.
  * **Transiciones de Entrada y Salida Fluidas:** Ningún elemento gráfico, modal o producto debe aparecer o desaparecer bruscamente. Cada componente entra con elevación suave (`y: 16 -> 0`, `opacity: 0 -> 1`, curva cúbica de aceleración `cubic-bezier(0.16, 1, 0.3, 1)`) y desaparece con fundido suave.
  * **Microinteracciones Sensoriales:** Brillo sutil de brasas al presionar platos y retroalimentación táctil limpia.

### 3.2. Presencia de ARSIGEN en la Carta (Pie de Página)
En el extremo final de la carta digital, tras la última categoría de postres y coctelería, se ubica el bloque de respaldo tecnológico:
* Logotipo o monograma vectorizado minimalista de ARSIGEN.
* Texto descriptivo: *"Tecnología gastronómica desarrollada por ARSIGEN"*.
* Enlace activo: `https://arsigen.com`.
* Mensaje comercial: *"¿Deseas una carta digital interactiva y sistema POS para tu negocio? Conoce nuestros planes y servicios en arsigen.com"*.

---

## 4. Requisitos Funcionales Detallados (`[REQ-xxx]`)

### 4.1. Capacidades y Restricciones Específicas por Plan

#### 4.1.A. Especificación Exclusiva del PLAN START
* **`[REQ-PLN-STA-01]` Carta Digital de Solo Lectura:** Menú digital público optimizado para carga ultrarrápida (< 800 ms). El cliente no posee panel administrativo ni facultades de edición autónoma.
* **`[REQ-PLN-STA-02]` Límite de Catálogo:** Hasta un máximo de **35 productos**. Las modificaciones periódicas (hasta 3 cambios al mes) son gestionadas por ARSIGEN / Desarrollador.
* **`[REQ-PLN-STA-03]` Restricción Total de Módulos:** Sin gestión de mesas, sin meseros, sin módulos de caja, sin enlaces de redes sociales ni Google Maps.

#### 4.1.B. Especificación Exclusiva del PLAN PRO
* **`[REQ-PLN-PRO-01]` Autogestión de Carta para Administrador:** Permite a **1 único Administrador** (`ACT-ADM`) autenticado editar descripciones, fotos, disponibilidad y precios.
* **`[REQ-PLN-PRO-02]` Capacidad de Catálogo:** Hasta **50 productos** organizados en categorías vectoriales SVG.
* **`[REQ-PLN-PRO-03]` Pausa de Stock en Tiempo Real:** Botón de disponibilidad inmediata (`disponible: true/false`) para pausar platos agotados al instante.
* **`[REQ-PLN-PRO-04]` Conversión y Búsqueda:** Buscador predictivo interactivo, botón directo para reseñas en Google Maps y enlaces a redes sociales.
* **`[REQ-PLN-PRO-05]` Restricciones Operativas:** No incluye gestión de mesas, ni meseros, ni comandas térmicas.

#### 4.1.C. Especificación Exclusiva del PLAN BUSINESS
* **`[REQ-PLN-BUS-01]` Catálogo Ilimitado:** Sin tope de productos para abarcar la carta completa.
* **`[REQ-PLN-BUS-02]` Módulo de Meseros Ilimitados con Google OAuth:** Acceso para meseros mediante su cuenta de Google pre-autorizada en Firestore.
* **`[REQ-PLN-BUS-03]` Gestión de Mesas Dinámica:** Soporte de hasta **70 mesas físicas**, con ciclo de vida (Vacía, Sin Imprimir / Alerta, Ocupada/Impresa).
* **`[REQ-PLN-BUS-04]` Despacho y Caja en Tiempo Real:** Panel de control con sincronización < 200 ms vía listeners de Firestore.
* **`[REQ-PLN-BUS-05]` Impresión Térmica Especializada (POS-5890U-L):** Formatos nativos ESC/POS en 58 mm: comanda inicial de preparación, comanda de adición de nuevas rondas y pre-cuenta/recibo para el comensal.
* **`[REQ-PLN-BUS-06]` Estadísticas Financieras Auditadas:** Métricas calculadas estrictamente sobre órdenes pagadas.

---

### 4.2. Módulo de Menú Público del Comensal (Todos los Planes)
* **`[REQ-MNU-01]` Visualización Responsiva y Editorial:** Presentación fluida sin contenedores cuadrados genéricos. Navegación táctil con scroll lateral suave.
* **`[REQ-MNU-02]` Sincronización en Tiempo Real:** Las actualizaciones de disponibilidad o precios se reflejan en el navegador del cliente sin recargar la página.
* **`[REQ-MNU-03]` Precios con IVA Incluido:** Todos los precios exhibidos representan el valor neto a pagar. Cero cálculo ni desglose de IVA.
* **`[REQ-MNU-04]` Acceso de Sigilo para Personal (Stealth Trigger):** El acceso al personal se activa discretamente mediante tres toques consecutivos sobre el logo en un lapso < 1000 ms. Los toques 1 y 2 permanecen totalmente inertes visual y sonoramente ante el comensal.
* **`[REQ-MNU-05]` Inexistencia de Controles Expuestos:** La vista pública carece por completo de botones de selección de plan, switchers de roles o enlaces visibles de inicio de sesión.

---

### 4.3. Módulo Administrativo de Carta (Planes Pro y Business)
* **`[REQ-ADM-01]` Autenticación Google Whitelist:** El Administrador ingresa con su cuenta de Google registrada en la colección `authorized_staff`.
* **`[REQ-ADM-02]` Edición de Catálogo dentro del Límite:** Alta, edición y baja de productos y categorías dentro del cupo del plan.
* **`[REQ-ADM-03]` Iconografía Vectorial SVG en Categorías:** Uso de iconos SVG predefinidos; prohibición de emojis en base de datos.
* **`[REQ-ADM-04]` Uso Interno del Campo `sortOrder`:** Define la secuencia de despliegue sin exhibir la numeración al cliente.
* **`[REQ-ADM-05]` Inmutabilidad de Ventas Pasadas:** Modificar un precio actualiza el menú y futuros pedidos, pero jamás altera las órdenes ya emitidas.

---

### 4.4. Módulo de Salón y Flujo de Orden del Mesero (Plan Business)
* **`[REQ-WTR-01]` Acceso Individual con Google OAuth:** El mesero inicia sesión mediante su cuenta Gmail autorizada (se erradican los PINs).
* **`[REQ-WTR-02]` Mapa de Mesas Binario:** Estado visual simple para el mesero: **Vacía (Verde)** u **Ocupada (Ámbar/Rojo)**.
* **`[REQ-WTR-03] Flujo de Comanda en 3 Espacios Ergonómicos:**
  1. **Espacio 1 — Barra de Búsqueda Superior:** Filtrado instantáneo por nombre de plato con menú flotante predictivo.
  2. **Espacio 2 — Sección Central de Ítems Seleccionados:** Renglones dinámicos con controles táctiles de cantidad, subtotal y notas de preparación personalizadas (*"término medio"*, *"sin cilantro"*).
  3. **Espacio 3 — Selector Inferior por Categorías:** Barra horizontal con iconos SVG para exploración rápida táctil.
* **`[REQ-WTR-04]` Despacho a Cocina/Caja:** Al presionar *"Enviar a Cocina"*, la orden pasa a `sin_imprimir` y genera timestamp `createdAt`.
* **`[REQ-WTR-05]` Adición de Nuevas Rondas:** Si la mesa ya está ocupada, los nuevos platos se marcan con `isAddedRound: true` y la mesa vuelve al estado `sin_imprimir (Adición)` en caja.
* **`[REQ-WTR-06]` Prohibición de Cobro y Anulación:** El mesero no puede marcar mesas como pagadas ni eliminar comandas despachadas.

---

### 4.5. Módulo de Despacho y Caja en Tiempo Real (Plan Business)
* **`[REQ-KDS-01]` Tablero Tripartito de Mesas:** El administrador visualiza: **Vacía**, **Sin Imprimir (Alerta destacada)** y **Ocupada / Impresa**.
* **`[REQ-KDS-02]` Impresión ESC/POS en POS-5890U-L:** Emisión térmica física con formatos dedicados:
  * **Comanda Inicial:** Datos de salón, mesa, mesero y lista de platos con observaciones (sin valores monetarios).
  * **Comanda de Adición:** Rotulada `*** COMANDA DE ADICIÓN ***` conteniendo únicamente los ítems de rondas posteriores.
  * **Pre-cuenta de Consumo:** Detalle de platos, precios unitarios, total final (IVA incluido) y propina sugerida (10%).
* **`[REQ-KDS-03]` Cobro y Congelamiento Inmutable:** Al pulsar *"Marcar como Pagado"*, se registra método de pago, timestamp `paidAt` y la orden pasa a estado `pagada`, quedando **inmutable de forma permanente**.

---

### 4.6. Módulo Estadístico y Financiero (Plan Business)
* **`[REQ-STA-01]` Cálculo Exclusivo sobre Órdenes Pagadas:** Únicamente las órdenes con `status == 'pagada'` entran en los cómputos financieros y métricas de desempeño.
* **`[REQ-STA-02]` Métricas Financieras Libres de Impuestos:** Total facturado real, ticket promedio por mesa, ventas del día y ventas del mes.
* **`[REQ-STA-03]` Métricas de Salón:** Platos más vendidos (volumen e ingresos) y ranking de desempeño por mesero.

---

## 5. Requisitos No Funcionales (`[NFR-xxx]`)

* **`[NFR-PER-01]` Rendimiento de Carga:** Menú público cargado y completamente interactivo en menos de **800 ms** en móviles 4G.
* **`[NFR-PER-02]` Latencia de Comandas:** Propagación de órdenes desde el móvil del mesero a la pantalla de caja en menos de **200 ms**.
* **`[NFR-SEC-01]` Control de Acceso Whitelist en Servidor:** Si un usuario inicia sesión con una cuenta de Google no registrada en `authorized_staff`, el sistema expulsa la sesión (`signOut()`) y bloquea el acceso.
* **`[NFR-SEC-02]` Cero Hardcoding de Credenciales:** Prohibido escribir correos electrónicos de usuarios en el código fuente o archivos públicos.
* **`[NFR-SEC-03]` Inmutabilidad Absoluta:** Órdenes pagadas no pueden ser editadas ni borradas por ningún perfil en Firestore (`delete: false`).
