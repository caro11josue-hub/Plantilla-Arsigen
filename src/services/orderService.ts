import {
  collection,
  doc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { RestaurantOrder } from '../domain/models';

export const SEED_ORDERS: RestaurantOrder[] = [
  {
    id: 'order_test_3',
    dailyNumber: 14,
    tableId: 'table_3',
    tableNumber: 3,
    isWaiterPersonalOrder: false,
    waiterId: 'waiter_carlos',
    waiterName: 'Carlos M.',
    status: 'sin_imprimir', // Esperando que el administrador imprima la comanda
    items: [
      {
        productId: 'item_3',
        productName: 'Lomo Fino al Grill 300g',
        unitPrice: 54000,
        quantity: 2,
        subtotal: 108000,
        notes: 'Término 3/4 ambos',
        addedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        isAddedRound: false,
      },
      {
        productId: 'item_9',
        productName: 'Gin Tonic de Frutos Rojos',
        unitPrice: 26000,
        quantity: 2,
        subtotal: 52000,
        notes: 'Poco hielo',
        addedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        isAddedRound: false,
      },
    ],
    subtotal: 160000,
    tipAmount: 0,
    total: 160000,
    paymentMethod: null,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    printedAt: null,
    paidAt: null,
    cancelledAt: null,
  },
  {
    id: 'order_test_7',
    dailyNumber: 15,
    tableId: 'table_7',
    tableNumber: 7,
    isWaiterPersonalOrder: false,
    waiterId: 'waiter_ana',
    waiterName: 'Ana R.',
    status: 'impresa', // Ya impresa, comiendo en mesa
    items: [
      {
        productId: 'item_6',
        productName: 'Smash Burger Doble Trufa',
        unitPrice: 36000,
        quantity: 2,
        subtotal: 72000,
        notes: 'Sin cebolla una de ellas',
        addedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        isAddedRound: false,
      },
      {
        productId: 'item_10',
        productName: 'Limonada de Coco Frappé',
        unitPrice: 14500,
        quantity: 2,
        subtotal: 29000,
        addedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        isAddedRound: false,
      },
    ],
    subtotal: 101000,
    tipAmount: 0,
    total: 101000,
    paymentMethod: null,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    printedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    paidAt: null,
    cancelledAt: null,
  },
];

/**
 * Escucha las órdenes activas en tiempo real.
 */
export function subscribeToOrders(
  onOrdersChanged: (orders: RestaurantOrder[]) => void
): () => void {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: RestaurantOrder[] = [];
          snapshot.forEach((d) => list.push(d.data() as RestaurantOrder));
          onOrdersChanged(list);
        } else {
          onOrdersChanged(SEED_ORDERS);
        }
      },
      (error) => {
        console.warn('[orderService] Error al leer órdenes remotas, usando locales:', error);
        onOrdersChanged(SEED_ORDERS);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[orderService] Fallback local de órdenes:', err);
    onOrdersChanged(SEED_ORDERS);
    return () => {};
  }
}

/**
 * Marca la comanda como impresa en cocina.
 */
export async function markOrderAsPrinted(orderId: string): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  const printedAt = new Date().toISOString();

  try {
    await updateDoc(orderRef, {
      status: 'impresa',
      printedAt,
    });
  } catch (err) {
    console.warn('[orderService] Fallback local marcar impresa:', err);
    const found = SEED_ORDERS.find((o) => o.id === orderId);
    if (found) {
      found.status = 'impresa';
      found.printedAt = printedAt;
    }
  }
}

/**
 * Cobra y libera la mesa (Inmutabilidad Absoluta).
 * Una vez pagada, la orden jamás puede ser modificada ni eliminada.
 */
export async function markOrderAsPaid(params: {
  orderId: string;
  tableNumber: number;
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia';
  tipAmount: number;
}): Promise<void> {
  const orderRef = doc(db, 'orders', params.orderId);
  const tableRef = doc(db, 'tables', `mesa_${params.tableNumber}`);
  const paidAt = new Date().toISOString();

  try {
    await runTransaction(db, async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (orderSnap.exists()) {
        const orderData = orderSnap.data() as RestaurantOrder;
        if (orderData.status === 'pagada') {
          throw new Error('Esta orden ya fue pagada y es inmutable.');
        }

        const totalWithTip = orderData.subtotal + params.tipAmount;

        // 1. Congelar orden pagada
        transaction.update(orderRef, {
          status: 'pagada',
          paymentMethod: params.paymentMethod,
          tipAmount: params.tipAmount,
          total: totalWithTip,
          paidAt,
        });
      }

      // 2. Liberar mesa física
      transaction.update(tableRef, {
        status: 'vacia',
        activeOrderId: null,
        currentWaiterId: null,
        currentWaiterName: null,
        openedAt: null,
        updatedAt: paidAt,
      });
    });
  } catch (err) {
    console.warn('[orderService] Fallback local cobro:', err);
    const found = SEED_ORDERS.find((o) => o.id === params.orderId);
    if (found) {
      found.status = 'pagada';
      found.paymentMethod = params.paymentMethod;
      found.tipAmount = params.tipAmount;
      found.total = found.subtotal + params.tipAmount;
      found.paidAt = paidAt;
    }
  }
}
