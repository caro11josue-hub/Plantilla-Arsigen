export interface DailySalesSummary {
  date: string;
  grossSales: number;
  ordersCount: number;
  averageTicket: number;
}

export interface ProductSalesRanking {
  productId: string;
  productName: string;
  unitsSold: number;
  revenueGenerated: number;
}

export interface WaiterPerformanceSummary {
  waiterId: string;
  waiterName: string;
  ordersServed: number;
  totalBilled: number;
}
