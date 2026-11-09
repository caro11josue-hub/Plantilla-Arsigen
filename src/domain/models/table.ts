export type TableStatus = 'vacia' | 'sin_imprimir' | 'ocupada';

export interface RestaurantTable {
  id: string;
  number: number;
  name: string;
  capacity: number;
  status: TableStatus;
  activeOrderId: string | null;
  currentWaiterId: string | null;
  currentWaiterName: string | null;
  openedAt: string | null;
  updatedAt: string;
}
