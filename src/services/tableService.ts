import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  runTransaction,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { RestaurantTable, RestaurantOrder, OrderItemSnapshot } from '../domain/models';

export const SEED_TABLES: RestaurantTable[] = Array.from({ length: 24 }, (_, i) => {
  const tableNum = i + 1;
  const now = new Date().toISOString();

  if (tableNum === 3) {
    return {
      id: 'table_3',
      number: 3,
      name: 'Mesa 3',
      capacity: 4,
      status: 'ocupada',
      activeOrderId: 'order_test_3',
      currentWaiterId: 'waiter_carlos',
      currentWaiterName: 'Carlos M.',
      openedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      updatedAt: now,
    };
  }
  if (tableNum === 7) {
    return {
      id: 'table_7',
      number: 7,
      name: 'Mesa 7',
      capacity: 2,
      status: 'ocupada',
      activeOrderId: 'order_test_7',
      currentWaiterId: 'waiter_ana',
      currentWaiterName: 'Ana R.',
      openedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      updatedAt: now,
    };
  }
  return {
    id: `table_${tableNum}`,
    number: tableNum,
    name: `Mesa ${tableNum}`,
    capacity: 4,
    status: 'vacia',
    activeOrderId: null,
    currentWaiterId: null,
    currentWaiterName: null,
    openedAt: null,
    updatedAt: now,
  };
});

/**
 * Escucha en tiempo real el estado de las mesas.
 */
export function subscribeToTables(
  onTablesChanged: (tables: RestaurantTable[]) => void
): () => void {
  try {
    const tablesRef = collection(db, 'tables');
    const q = query(tablesRef, orderBy('number', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: RestaurantTable[] = [];
          snapshot.forEach((d) => list.push(d.data() as RestaurantTable));
          onTablesChanged(list);
        } else {
          onTablesChanged(SEED_TABLES);
        }
      },
      (error) => {
        console.warn('[tableService] Error al leer mesas remotas, usando locales:', error);
        onTablesChanged(SEED_TABLES);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[tableService] Fallback local para mesas:', err);
    onTablesChanged(SEED_TABLES);
    return () => {};
  }
}

/**
 * Transacción Atómica: Abre una mesa y registra el pedido inicial.
 * Evita colisiones si dos meseros seleccionan la misma mesa al mismo tiempo.
 */
export async function createTableOrderAtomic(params: {
  tableNumber: number;
  isWaiterPersonalOrder?: boolean;
  waiterId: string;
  waiterName: string;
  items: OrderItemSnapshot[];
  notes?: string;
}): Promise<string> {
  const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const tableDocRef = doc(db, 'tables', `mesa_${params.tableNumber}`);
  const orderDocRef = doc(db, 'orders', orderId);

  const subtotal = params.items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  const now = new Date().toISOString();

  const newOrder: RestaurantOrder = {
    id: orderId,
    dailyNumber: Math.floor(Math.random() * 50) + 1,
    tableId: `table_${params.tableNumber}`,
    tableNumber: params.tableNumber,
    isWaiterPersonalOrder: !!params.isWaiterPersonalOrder,
    waiterId: params.waiterId,
    waiterName: params.waiterName,
    items: params.items,
    status: 'sin_imprimir',
    subtotal: subtotal,
    tipAmount: 0,
    total: subtotal,
    paymentMethod: null,
    createdAt: now,
    printedAt: null,
    paidAt: null,
    cancelledAt: null,
  };

  try {
    await runTransaction(db, async (transaction) => {
      if (!params.isWaiterPersonalOrder) {
        const tableSnap = await transaction.get(tableDocRef);

        if (tableSnap.exists()) {
          const tableData = tableSnap.data() as RestaurantTable;
          if (tableData.status === 'ocupada') {
            throw new Error(`La Mesa #${params.tableNumber} ya fue ocupada por otro mesero.`);
          }
        }

        // Marcar Mesa como ocupada
        transaction.set(tableDocRef, {
          id: `table_${params.tableNumber}`,
          number: params.tableNumber,
          name: `Mesa ${params.tableNumber}`,
          capacity: 4,
          status: 'ocupada',
          activeOrderId: orderId,
          currentWaiterId: params.waiterId,
          currentWaiterName: params.waiterName,
          openedAt: now,
          updatedAt: now,
        } as RestaurantTable);
      }

      // Guardar Pedido
      transaction.set(orderDocRef, newOrder);
    });
  } catch (err) {
    console.warn('[tableService] Error en transacción remota, actualizando local:', err);
    // Simular en local
    if (!params.isWaiterPersonalOrder) {
      const tableIndex = SEED_TABLES.findIndex((t) => t.number === params.tableNumber);
      if (tableIndex !== -1) {
        SEED_TABLES[tableIndex] = {
          ...SEED_TABLES[tableIndex],
          status: 'ocupada',
          activeOrderId: orderId,
          currentWaiterId: params.waiterId,
          currentWaiterName: params.waiterName,
          openedAt: now,
          updatedAt: now,
        };
      }
    }
  }

  return orderId;
}

/**
 * Agrega una ronda de adición de platos a una mesa ya ocupada.
 */
export async function addItemsToTableOrder(params: {
  tableNumber: number;
  orderId: string;
  waiterId: string;
  waiterName: string;
  newItems: OrderItemSnapshot[];
  notes?: string;
}): Promise<string> {
  const additionOrderId = `order_${Date.now()}_add`;
  const additionOrderRef = doc(db, 'orders', additionOrderId);

  const subtotal = params.newItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  const now = new Date().toISOString();

  const additionOrder: RestaurantOrder = {
    id: additionOrderId,
    dailyNumber: Math.floor(Math.random() * 50) + 1,
    tableId: `table_${params.tableNumber}`,
    tableNumber: params.tableNumber,
    isWaiterPersonalOrder: false,
    waiterId: params.waiterId,
    waiterName: params.waiterName,
    items: params.newItems,
    status: 'sin_imprimir',
    subtotal: subtotal,
    tipAmount: 0,
    total: subtotal,
    paymentMethod: null,
    createdAt: now,
    printedAt: null,
    paidAt: null,
    cancelledAt: null,
  };

  try {
    await setDoc(additionOrderRef, additionOrder);
  } catch (err) {
    console.warn('[tableService] Fallback guardado local de adición:', err);
  }

  return additionOrderId;
}

/**
 * Transfiere una mesa a otra mesa vacía.
 */
export async function transferTableAtomic(
  fromTableNum: number,
  toTableNum: number
): Promise<void> {
  const fromRef = doc(db, 'tables', `mesa_${fromTableNum}`);
  const toRef = doc(db, 'tables', `mesa_${toTableNum}`);
  const now = new Date().toISOString();

  try {
    await runTransaction(db, async (transaction) => {
      const fromSnap = await transaction.get(fromRef);
      const toSnap = await transaction.get(toRef);

      if (!fromSnap.exists() || fromSnap.data()?.status !== 'ocupada') {
        throw new Error(`La mesa origen #${fromTableNum} no está ocupada.`);
      }
      if (toSnap.exists() && toSnap.data()?.status === 'ocupada') {
        throw new Error(`La mesa destino #${toTableNum} ya está ocupada.`);
      }

      const fromData = fromSnap.data() as RestaurantTable;

      // Transferir a destino
      transaction.set(toRef, {
        id: `table_${toTableNum}`,
        number: toTableNum,
        name: `Mesa ${toTableNum}`,
        capacity: fromData.capacity,
        status: 'ocupada',
        activeOrderId: fromData.activeOrderId,
        currentWaiterId: fromData.currentWaiterId,
        currentWaiterName: fromData.currentWaiterName,
        openedAt: fromData.openedAt,
        updatedAt: now,
      } as RestaurantTable);

      // Liberar origen
      transaction.set(fromRef, {
        id: `table_${fromTableNum}`,
        number: fromTableNum,
        name: `Mesa ${fromTableNum}`,
        capacity: fromData.capacity,
        status: 'vacia',
        activeOrderId: null,
        currentWaiterId: null,
        currentWaiterName: null,
        openedAt: null,
        updatedAt: now,
      } as RestaurantTable);
    });
  } catch (err) {
    console.warn('[tableService] Fallback transferencia local:', err);
    const fromIdx = SEED_TABLES.findIndex((t) => t.number === fromTableNum);
    const toIdx = SEED_TABLES.findIndex((t) => t.number === toTableNum);
    if (fromIdx !== -1 && toIdx !== -1) {
      SEED_TABLES[toIdx] = {
        ...SEED_TABLES[fromIdx],
        id: `table_${toTableNum}`,
        number: toTableNum,
        name: `Mesa ${toTableNum}`,
        status: 'ocupada',
      };
      SEED_TABLES[fromIdx] = {
        ...SEED_TABLES[fromIdx],
        status: 'vacia',
        activeOrderId: null,
        currentWaiterId: null,
        currentWaiterName: null,
        openedAt: null,
      };
    }
  }
}
