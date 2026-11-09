# 📜 Constitución Técnica · ARSIGEN GastroPOS
## Sistema Operativo Gastronómico & Plantilla Base ("Bistró & Leña")

---

## Principios Fundacionales No Negociables

### I. Modelo de Software Cerrado (Non-SaaS Público)
* El acceso no autenticado a través de la URL o código QR de una mesa es **exclusiva y estrictamente la carta digital del restaurante**.
* Queda terminantemente prohibido exponer barras de navegación públicas con selectores de perspectiva ("Panel Admin", "Caja", "Meseros") o botones de cambio de plan ("Start", "Pro", "Business").
* Los módulos internos son invisibles para los comensales. El personal accede a través de una puerta discreta (gatillo silencioso de 3 toques sobre el logo) y se autentica mediante Google OAuth contra la lista autorizada en el servidor (`authorized_staff`).

### II. Cero Hardcoding y Soberanía de Credenciales
* Ninguna dirección de correo electrónico, clave de API sensible o credencial de usuario debe ser escrita en el código fuente de Git ni en los documentos públicos.
* Todos los correos autorizados se gestionan en Cloud Firestore (`/authorized_staff`) o variables protegidas del servidor.
* Si una cuenta de Google no autorizada inicia sesión, el sistema ejecuta de inmediato `auth.signOut()`, bloquea el acceso y permanece en la carta digital.

### III. Desacoplamiento de Marca (Restaurante vs Desarrollador)
* El front-end del menú pertenece 100% a la identidad de marca del restaurante (en esta plantilla base: *"Bistró & Leña · Fuego Sagrado"*).
* Se prohíbe el uso de contenedores cuadrados genéricos tipo "cajas de catálogo". Se adopta un layout editorial gastronómico con física de scroll lateral, microinteracciones y gradientes cálidos.
* La presencia de **ARSIGEN** se restringe de forma estricta a un pie de página minimalista, sobrio y elegante en el extremo final de la carta digital, con enlace activo a `arsigen.com`.

### IV. Inmutabilidad Financiera Absoluta
* En el instante en que una comanda transiciona a estado `status == 'pagada'`, queda permanentemente congelada.
* Queda prohibido a cualquier rol (incluidos el Administrador y el Desarrollador) modificar precios, ítems o eliminar registros pagados en la base de datos (`firestore.rules` con `delete: false`).
* Todos los precios ingresados ya contemplan el IVA. Cero cálculos de bases gravables o retenciones tributarias en la lógica del sistema.

### V. Desarrollo Orientado a Especificaciones (SSD)
* La fuente única de verdad son los 5 documentos maestros (`1_SRS` a `5_ROADMAP`) y los 3 documentos de diagramas (`DIAGRAM_ENTITY_RELATIONSHIP.md`, `DIAGRAM_SEQUENCE.md`, `DIAGRAM_FLOWCHARTS_AND_STATES.md`).
* Ningún cambio en el código fuente puede ejecutarse sin estar previamente especificado, trazado y aprobado.

---

## Jerarquía de Roles de Personal (RBAC)

1. **`developer`:** Superadministrador de infraestructura (Josué Caro). Controla aprovisionamiento inicial y cambio en vivo de planes (`start` $\leftrightarrow$ `pro` $\leftrightarrow$ `business`) sin redespliegue.
2. **`admin`:** Administrador o dueño del establecimiento (**exactamente 1 por restaurante**). Gestiona catálogo (en Pro/Business), caja y cobro, e impresión térmica en POS-5890U-L.
3. **`waiter`:** Meseros de salón (**ilimitados**). Ingresan con su cuenta de Google autorizada. Manejan mesas y toman comandas en 3 espacios ergonómicos. Prohibido cobrar o cancelar.
4. **`customer`:** Comensal público no autenticado. Solo consulta la carta interactiva.

---

## Gobernanza y Enmiendas
Cualquier modificación a esta constitución requiere la actualización correspondiente en las especificaciones maestras y la confirmación explícita del propietario de ARSIGEN SAS.

**Versión:** 1.2.0 | **Ratificada:** 2026-11-09 | **Autor:** Josué Caro & Antigravity
