export type OrderStatus = 'sin_imprimir' | 'impresa' | 'pagada' | 'cancelada';

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  unitPrice: number; // Precio unitario congelado con IVA incluido al momento de la orden
  quantity: number;
  subtotal: number;  // unitPrice * quantity
  notes?: string;
  addedAt: string;
  isAddedRound: boolean;
}

export interface RestaurantOrder {
  id: string;
  dailyNumber: number;
  tableId: string;
  tableNumber: number;
  isWaiterPersonalOrder: boolean;
  isAddition?: boolean;
  parentOrderId?: string;
  waiterId: string;
  waiterName: string;
  status: OrderStatus;
  items: OrderItemSnapshot[];
  subtotal: number; // Suma de subtotales (con IVA incluido)
  tipAmount: number;
  total: number;    // subtotal + tipAmount
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia' | null;
  createdAt: string;
  printedAt: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  cancellationReason?: string;
}
