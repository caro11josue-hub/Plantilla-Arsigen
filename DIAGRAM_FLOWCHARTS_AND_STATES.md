# 🔀 DIAGRAMAS DE FLUJO Y MÁQUINAS DE ESTADOS
## Lógica Operativa, Ciclos de Vida y Manejo de Excepciones · ARSIGEN GastroPOS
### Plantilla Base: "Bistró & Leña · Fuego Sagrado"

---

### Control del Documento
* **Código:** `ARS-DIAG-FLO-003`
* **Versión:** `1.0.0`
* **Estado:** Aprobado para Auditoría y Construcción
* **Fecha:** 2026-11-09
* **Autor:** Josué Caro (ARSIGEN SAS) & Antigravity Lead Architect
* **Documentos Vinculados:** [1_SOFTWARE_REQUIREMENTS_SPECIFICATION.md](file:///c:/Users/JOSUE/PROYECTOS/Plantilla%20Arsigen/1_SOFTWARE_REQUIREMENTS_SPECIFICATION.md) y [4_BUSINESS_RULES_AND_PERMISSIONS.md](file:///c:/Users/JOSUE/PROYECTOS/Plantilla%20Arsigen/4_BUSINESS_RULES_AND_PERMISSIONS.md)

---

## 1. Máquina de Estados: Ciclo de Vida de Mesas Físicas (`/tables`)

El estado de cada una de las mesas físicas transiciona a través de eventos operativos ejecutados por los meseros y el cajero.

```mermaid
stateDiagram-v2
    [*] --> vacia: Inicialización del Restaurante

    vacia --> sin_imprimir: Mesero envía 1ª Comanda (createdAt)
    note right of vacia
        Perspectiva Mesero: Verde (Disponible)
        Perspectiva Caja: Verde (Libre)
    end note

    sin_imprimir --> ocupada: Cajero imprime comanda en POS-5890U-L (printedAt)
    sin_imprimir --> sin_imprimir: Mesero agrega platos (isAddedRound = true)
    
    note right of sin_imprimir
        Perspectiva Mesero: Ámbar / Ocupada
        Perspectiva Caja: Ámbar Pulsante (ALERTA DE DESPACHO)
    end note

    ocupada --> sin_imprimir: Mesero envía Adición / 2ª Ronda
    note right of ocupada
        Perspectiva Mesero: Rojo / Ocupada
        Perspectiva Caja: Azul (En Consumo / Servida)
    end note

    ocupada --> vacia: Cajero registra Cobro Exitoso (paidAt)
    sin_imprimir --> vacia: Admin anula orden con motivo obligatorio

    note left of vacia
        Al cobrar, la mesa se reinicia a vacia,
        activeOrderId pasa a null y la orden queda inmutable.
    end note
```

### Tabla Formal de Transiciones de Mesa:

| Estado Actual | Evento Disparador | Actor | Nuevo Estado | Efecto Colateral en el Sistema |
|---|---|---|---|---|
| `vacia` | `CREAR_PRIMERA_COMANDA` | Mesero | `sin_imprimir` | Asigna `activeOrderId`, genera `createdAt`, alerta visual en caja (<200ms). |
| `sin_imprimir` | `IMPRIMIR_COMANDA_INICIAL` | Admin/Cajero | `ocupada` | Emite ticket físico en POS-5890U-L, registra `printedAt`. |
| `ocupada` | `ENVIAR_ADICION_RONDA` | Mesero | `sin_imprimir` | Ítems marcados con `isAddedRound: true`, alerta de adición en caja. |
| `sin_imprimir` | `IMPRIMIR_ADICION` | Admin/Cajero | `ocupada` | Emite ticket parcial `*** COMANDA DE ADICIÓN ***`. |
| `ocupada` | `REGISTRAR_PAGO` | Admin/Cajero | `vacia` | Congela orden con `status = 'pagada'` y `paidAt`, desasigna mesa. |
| `sin_imprimir` | `ANULAR_ORDEN` | Admin | `vacia` | Exige `cancellationReason`, marca orden como `cancelada`, libera mesa. |

---

## 2. Máquina de Estados: Ciclo de Vida de Órdenes y Facturación (`/orders`)

Garantiza la inmutabilidad tributaria y financiera sin permitir alteraciones retroactivas.

```mermaid
stateDiagram-v2
    [*] --> sin_imprimir: Mesero despacha orden a cocina
    
    sin_imprimir --> impresa: Cajero imprime comanda en POS-5890U-L
    sin_imprimir --> cancelada: Administrador anula orden (con motivo)
    
    impresa --> sin_imprimir: Mesero añade nuevos platos (Adición)
    impresa --> pagada: Cajero cobra mesa (paidAt + medio de pago)
    impresa --> cancelada: Administrador anula comanda emitida
    
    pagada --> [*]: CONGELAMIENTO PERMANENTE (INMUTABLE)
    cancelada --> [*]: ARCHIVADO AUDITABLE (NO SUMA A VENTAS)

    note right of pagada
        INMUTABILIDAD ABSOLUTA:
        firestore.rules prohíbe terminantemente
        update y delete sobre documentos pagados.
    end note
```

---

## 3. Diagrama de Flujo: Control de Acceso y Enrutamiento (Software Cerrado)

Determina de forma binaria si el visitante visualiza la carta digital o si accede a los módulos protegidos.

```mermaid
flowchart TD
    Inicio(["Cliente entra a la URL o escanea QR"]) --> RenderMenu["Renderizar Carta Digital Comensal\n('Bistró & Leña · Fuego Sagrado')\n+ Footer Tecnológico ARSIGEN"]
    
    RenderMenu --> CheckClicks{"¿El usuario pulsa 3 veces seguidas\nel logo en < 1000 ms?"}
    
    CheckClicks -- NO --> ContinuaMenu["Navegación normal por categorías y platos\n(Sin botones ni enlaces administrativos)"]
    
    CheckClicks -- SÍ --> ModalAuth["Desplegar Modal de Acceso de Personal\nBotón: 'Continuar con Google'"]
    
    ModalAuth --> ClickGoogle["Usuario inicia sesión con Google OAuth"]
    ClickGoogle --> QueryWhitelist{"Consultar /authorized_staff/{email}\nen Cloud Firestore"}
    
    QueryWhitelist -- "NO EXISTE o active == false" --> SignOutForzoso["auth.signOut()\nModal de Error: 'Acceso No Autorizado'\nRegresar a Carta Digital"]
    
    QueryWhitelist -- "EXISTE y active == true" --> ReadRole{"Leer Atributo 'role'"}
    
    ReadRole -- role == 'waiter' --> OpenWaiter["Abrir PWA de Salón (<WaiterModuleView />)\nMapa de Mesas y Toma de Pedidos"]
    ReadRole -- role == 'admin' --> OpenAdmin["Abrir Panel Admin (<AdminDashboard />)\nMenú, Caja POS e Impresión Térmica"]
    ReadRole -- role == 'developer' --> OpenDev["Abrir Consola Maestra de Infraestructura\nConmutador de Planes y Aprovisionamiento"]
```

---

## 4. Diagramas de Flujo de Tolerancia a Fallos y Excepciones

### 4.1. Tolerancia a Pérdida de Conexión en Salón (Modo Offline)

```mermaid
flowchart TD
    MeseroAccion["Mesero presiona 'Enviar a Cocina'"] --> RedCheck{"¿Hay conexión a Internet?"}
    
    RedCheck -- SÍ --> DispatchOnline["Firestore sincroniza en la nube\nCaja recibe en < 200 ms"]
    
    RedCheck -- NO --> CacheLocal["IndexedDB local encola la mutación\n(persistentLocalCache)"]
    CacheLocal --> FeedbackUI["UI del mesero muestra estado:\n'Guardado localmente · Sincronizando al reconectar'"]
    FeedbackUI --> WaitNetwork{"¿Se restablece la señal Wi-Fi?"}
    WaitNetwork -- SÍ --> AutoFlush["SDK de Firestore envía mutación encolada"]
    AutoFlush --> DispatchOnline
```

### 4.2. Tolerancia a Fallos de Impresora Térmica POS-5890U-L

```mermaid
flowchart TD
    BotonImprimir["Cajero presiona 'Imprimir Comanda'"] --> TestDevice{"¿Impresora POS-5890U-L conectada?"}
    
    TestDevice -- NO / Desconectada --> ModalAlerta["Modal de Contingencia:\n'Impresora no detectada vía USB/Bluetooth'"]
    ModalAlerta --> OpcionesCajero{"Acción del Cajero"}
    
    OpcionesCajero -- Reintentar Conexión --> Reconnect["Reconectar cable / vincular Bluetooth"]
    Reconnect --> TestDevice
    
    OpcionesCajero -- Omitir Papel --> SkipPrint["Marcar comanda como 'impresa en pantalla'\nMesa pasa a estado ocupada sin ticket"]
    
    TestDevice -- SÍ / Conectada --> CheckPaper{"¿Tiene papel térmico?"}
    CheckPaper -- Sin Papel --> ErrorPaper["Alerta sonora: 'Inserte rollo de 58 mm'"]
    ErrorPaper --> ReplaceRoll["Cajero cambia el rollo de papel"]
    ReplaceRoll --> CheckPaper
    
    CheckPaper -- SÍ --> PrintOK["Impresión física exitosa de 32 columnas\nMesa pasa formalmente a 'ocupada'"]
```

### 4.3. Prevención de Condiciones de Carrera (Dos Meseros en la Misma Mesa)

```mermaid
flowchart TD
    Mesero1["Mesero A toca Mesa 03 (t = 0 ms)"] --> Tx1["Ejecutar runTransaction()"]
    Mesero2["Mesero B toca Mesa 03 (t = 5 ms)"] --> Tx2["Ejecutar runTransaction()"]
    
    Tx1 --> CheckMesaA{"¿Estado == 'vacia'?"}
    CheckMesaA -- SÍ --> LockMesa["Asignar Mesa 03 a Mesero A\nCambiar estado a 'sin_imprimir'"]
    LockMesa --> ExitoA["Mesero A accede al cajón de comanda"]
    
    Tx2 --> CheckMesaB{"¿Estado == 'vacia'?"}
    CheckMesaB -- NO (Ya asignada a A) --> AbortTx["Transacción B abortada de forma atómica"]
    AbortTx --> ToastB["Toast en móvil de Mesero B:\n'Mesa 03 ocupada por Mesero A. Selecciona otra mesa.'"]
```
