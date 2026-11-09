# 🔄 DIAGRAMAS DE SECUENCIA OPERATIVA (UML SEQUENCE)
## Ecosistema Gastronómico ARSIGEN · Single-Core Modular Engine
### Plantilla Base: "Bistró & Leña · Fuego Sagrado"

---

### Control del Documento
* **Código:** `ARS-DIAG-SEQ-002`
* **Versión:** `1.0.0`
* **Estado:** Aprobado para Auditoría y Construcción
* **Fecha:** 2026-11-09
* **Autor:** Josué Caro (ARSIGEN SAS) & Antigravity Lead Architect
* **Documentos Vinculados:** [1_SOFTWARE_REQUIREMENTS_SPECIFICATION.md](file:///c:/Users/JOSUE/PROYECTOS/Plantilla%20Arsigen/1_SOFTWARE_REQUIREMENTS_SPECIFICATION.md) y [2_SOFTWARE_ARCHITECTURE_SPECIFICATION.md](file:///c:/Users/JOSUE/PROYECTOS/Plantilla%20Arsigen/2_SOFTWARE_ARCHITECTURE_SPECIFICATION.md)

---

## 1. Secuencia 1: Handshake de Autenticación con Google y Verificación Whitelist

Muestra cómo el personal accede al sistema mediante un punto de entrada discreto y cómo el servidor rechaza cualquier cuenta no autorizada.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Personal (Dev / Admin / Mesero)
    participant UI as Front-End (Web App)
    participant Auth as Firebase Authentication (Google OAuth)
    participant DB as Cloud Firestore (/authorized_staff)
    participant Router as Enrutador de Perspectivas

    Usuario->>UI: Realiza 3 toques sobre el Logo (<1000ms)
    Note over UI: Toques 1 y 2 permanecen 100% inertes.<br/>El toque 3 despliega el Modal de Acceso de Personal.
    UI-->>Usuario: Muestra botón "Continuar con Google"
    Usuario->>UI: Clic en "Continuar con Google"
    UI->>Auth: signInWithPopup(GoogleAuthProvider)
    Auth-->>UI: Retorna UserCredential (email, uid, idToken)
    
    UI->>DB: getDoc(doc(db, "authorized_staff", user.email))
    
    alt Caso A: Correo NO registrado o active == false
        DB-->>UI: Documento no existe O active == false
        UI->>Auth: auth.signOut()
        UI-->>Usuario: Modal de Alerta: "Acceso no autorizado para este local."
        UI->>Router: Forzar renderizado exclusivo de <CustomerMenuView />
    else Caso B: Correo registrado y active == true
        DB-->>UI: Retorna { role: "developer" | "admin" | "waiter", name: "...", active: true }
        UI->>DB: updateDoc(doc, { lastLoginAt: now(), currentSessionId: uuid })
        
        opt Rol 'developer'
            UI->>Router: Monta Consola Maestra de Infraestructura (Cambio de planes en vivo)
        end
        opt Rol 'admin'
            UI->>Router: Monta <AdminDashboard /> (Menú, Caja POS e Impresión Térmica)
        end
        opt Rol 'waiter'
            UI->>Router: Monta <WaiterModuleView /> (Mapa de Mesas y Toma de Pedidos)
        end
        UI-->>Usuario: Despliega interfaz operativa autorizada
    end
```

---

## 2. Secuencia 2: Toma de Comanda por Mesero en 3 Espacios Ergonómicos

Ilustra la selección de una mesa vacía, la interacción táctil en la pantalla dividida en tres zonas y el despacho atómico de la orden hacia cocina/caja.

```mermaid
sequenceDiagram
    autonumber
    actor Mesero as Mesero (Dispositivo Móvil)
    participant UI as Drawer de Pedido (3 Espacios)
    participant FS as Firestore (runTransaction)
    participant Cashier as Panel de Caja (onSnapshot)

    Mesero->>UI: Selecciona Mesa 04 en estado "Vacía (Verde)"
    UI->>UI: Inicializa orden en memoria (tableId: "table_04")
    UI-->>Mesero: Despliega cajón táctil en 3 espacios:
    Note over UI: Espacio 1: Buscador predictivo superior<br/>Espacio 2: Bandeja central de seleccionados<br/>Espacio 3: Selector horizontal de categorías SVG

    alt Búsqueda por Espacio 1
        Mesero->>UI: Escribe "Bife" en buscador superior
        UI-->>Mesero: Despliega lista flotante: "Bife de Chorizo Angus"
        Mesero->>UI: Toca el producto
    else Exploración por Espacio 3
        Mesero->>UI: Desliza carrusel inferior y toca "Cortes a la Brasa"
        Mesero->>UI: Toca "Bife de Chorizo Angus"
    end

    UI->>UI: Agrega ítem al Espacio 2 (Central)
    Mesero->>UI: Incrementa cantidad a 2 y añade nota: "Término 3/4"
    UI->>UI: Recalcula subtotal neto con IVA incluido ($96.000)

    Mesero->>UI: Presiona botón "Enviar a Cocina"
    
    UI->>FS: runTransaction()
    activate FS
    FS->>FS: Verifica que table_04 continúe en estado 'vacia'
    FS->>FS: Crea documento en /orders/{orderId} con status = 'sin_imprimir' y createdAt = now()
    FS->>FS: Actualiza /tables/table_04: status = 'sin_imprimir', activeOrderId = orderId
    FS-->>UI: Transacción exitosa
    deactivate FS

    UI-->>Mesero: Cierra cajón y actualiza Mesa 04 a "Ocupada (Ámbar)"
    FS-->>Cashier: Disparo en tiempo real (<200ms): Mesa 04 parpadea en ámbar pulsante
```

---

## 3. Secuencia 3: Detección en Caja e Impresión de Comanda Inicial (POS-5890U-L)

Muestra la recepción reactiva en la tablet de caja y el envío de comandos ESC/POS a la impresora térmica física de 58 mm.

```mermaid
sequenceDiagram
    autonumber
    actor Cajero as Administrador / Cajero
    participant Dashboard as Tablero de Caja en Tiempo Real
    participant Driver as ESC/POS Driver (Web Bluetooth / USB)
    participant Printer as Impresora Térmica POS-5890U-L
    participant FS as Cloud Firestore (/orders & /tables)

    FS-->>Dashboard: onSnapshot() detecta Mesa 04 en status 'sin_imprimir'
    Dashboard->>Dashboard: Activa alerta sonora sutil y resplandor ámbar
    Cajero->>Dashboard: Presiona botón "Imprimir Comanda"
    
    Dashboard->>Driver: buildInitialKitchenTicket(orderData)
    Note over Driver: Formatea a 32 columnas monoespaciadas.<br/>Encabezado, Consecutivo, Mesa, Mesero, Platos y Notas.<br/>CERO PRECIOS NI VALORES MONETARIOS.
    
    Driver->>Printer: Envía buffer binario ESC/POS (0x1B 0x40 ...)
    Printer-->>Cajero: Emite ticket físico para Cocina / Parrilla
    
    Dashboard->>FS: updateDoc(/orders/orderId, { status: 'impresa', printedAt: now() })
    Dashboard->>FS: updateDoc(/tables/table_04, { status: 'ocupada' })
    
    FS-->>Dashboard: Mesa 04 transiciona visualmente a estado "Ocupada (Azul)"
```

---

## 4. Secuencia 4: Adición de Segunda Ronda de Platos (`isAddedRound`)

Describe qué ocurre cuando los comensales ya sentados piden más platos o bebidas más tarde.

```mermaid
sequenceDiagram
    autonumber
    actor Mesero as Mesero (Salón)
    participant UI as Drawer de Pedido
    participant FS as Cloud Firestore (/orders & /tables)
    participant Dashboard as Tablero de Caja
    participant Driver as ESC/POS Driver
    participant Printer as POS-5890U-L (58mm)

    Mesero->>UI: Toca Mesa 04 (Ya en estado Ocupada)
    UI->>FS: Obtiene la orden activa existente
    UI-->>Mesero: Abre cajón mostrando los platos de la 1ª ronda
    
    Mesero->>UI: Agrega 2 cervezas artesanales y 1 postre
    Note over UI: Los ítems nuevos son etiquetados con<br/>isAddedRound: true y addedAt: now()
    
    Mesero->>UI: Presiona "Enviar Adición"
    UI->>FS: updateDoc(/orders/orderId, { items: arrayUnion(...), subtotal: nuevoTotal })
    UI->>FS: updateDoc(/tables/table_04, { status: 'sin_imprimir' })
    
    FS-->>Dashboard: onSnapshot(): Mesa 04 vuelve a parpadear como "Adición Pendiente"
    Dashboard-->>Cajero: Muestra botón "Imprimir Adición"
    
    Cajero->>Dashboard: Clic en "Imprimir Adición"
    Dashboard->>Driver: buildAddedRoundTicket(orderData, onlyAddedItems = true)
    Note over Driver: Ticket rotulado como: *** COMANDA DE ADICIÓN ***<br/>Contiene ÚNICAMENTE los ítems con isAddedRound == true.
    
    Driver->>Printer: Envía buffer binario
    Printer-->>Cajero: Emite ticket de adición para la cocina
    Dashboard->>FS: updateDoc(/tables/table_04, { status: 'ocupada' })
```

---

## 5. Secuencia 5: Pre-cuenta, Cobro y Congelamiento Inmutable

Muestra la solicitud de cuenta por parte del cliente, la emisión del comprobante con IVA ya incluido, el registro del pago y el sellado permanente de la orden.

```mermaid
sequenceDiagram
    autonumber
    actor Comensal as Comensal
    actor Mesero as Mesero / Cajero
    participant Dashboard as Panel de Caja
    participant Driver as ESC/POS Driver
    participant Printer as POS-5890U-L
    participant FS as Cloud Firestore (/orders & /tables)

    Comensal->>Mesero: Solicita la cuenta en la Mesa 04
    Mesero->>Dashboard: Solicita impresión de Pre-cuenta
    Dashboard->>Driver: buildCustomerPreReceipt(orderData)
    Note over Driver: Membrete del restaurante ("Bistró & Leña"),<br/>Desglose de ítems, Subtotal con IVA incluido,<br/>Propina sugerida 10%, Total final y Leyenda fiscal.
    
    Driver->>Printer: Emite comprobante de consumo en papel de 58 mm
    Printer-->>Mesero: Entrega ticket al comensal en la mesa
    
    Comensal->>Mesero: Realiza el pago ($261.800 en Tarjeta)
    Cajero->>Dashboard: Presiona "Cobrar Mesa 04" -> Selecciona "Tarjeta"
    
    Dashboard->>FS: runTransaction()
    activate FS
    FS->>FS: Actualiza /orders/orderId:<br/>status = 'pagada', paymentMethod = 'tarjeta', paidAt = now()
    FS->>FS: Actualiza /tables/table_04:<br/>status = 'vacia', activeOrderId = null, currentWaiterId = null
    FS-->>Dashboard: Cobro confirmado
    deactivate FS

    Note over FS: REGLAS DE SEGURIDAD ACTIVAS:<br/>Al tener status == 'pagada', firestore.rules bloquea<br/>cualquier intento de UPDATE o DELETE para siempre.

    Dashboard-->>Cajero: Mesa 04 liberada a color Verde ("Vacía")
```

---

## 6. Secuencia 6: Conmutación de Plan en Vivo por el Desarrollador

Demuestra cómo el Desarrollador (`caro11josue@gmail.com`) cambia el plan contratado (`start` $\leftrightarrow$ `pro` $\leftrightarrow$ `business`) en tiempo real sin requerir redespliegue de código.

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Desarrollador (Josué Caro)
    participant UI as Modal de Desarrollador
    participant FS as Cloud Firestore (/config/general)
    participant Clients as Todos los Clientes Conectados (Web & Móvil)

    Dev->>UI: Accede con su cuenta Google autorizada (Rol: 'developer')
    UI-->>Dev: Abre consola maestra de aprovisionamiento
    Dev->>UI: Conmuta plan de 'pro' a 'business'
    
    UI->>FS: updateDoc(/config/general, { plan: 'business', updatedAt: now() })
    
    FS-->>Clients: onSnapshot(/config/general) emite el nuevo plan
    Clients->>Clients: getCapabilitiesForPlan('business')
    Note over Clients: Desbloquea dinámicamente módulo de salón, mesas,<br/>impresora térmica POS-5890U-L y estadísticas financieras<br/>en < 150 ms sin refrescar el navegador.
```
