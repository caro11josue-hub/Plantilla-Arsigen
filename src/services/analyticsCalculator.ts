import { RestaurantOrder } from '../domain/models';
import { DailySalesSummary, ProductSalesRanking, WaiterPerformanceSummary } from '../domain/models/stats';

export interface FinancialAnalyticsReport {
  totalGrossSales: number;        // Suma neta facturada (sin IVA recalculado)
  totalTipsCollected: number;      // Propinas totales recaudadas
  paidOrdersCount: number;         // Número total de cuentas pagadas
  averageTicket: number;           // Ticket promedio por cuenta
  salesByPaymentMethod: {
    efectivo: number;
    tarjeta: number;
    transferencia: number;
  };
  productRanking: ProductSalesRanking[];
  waiterPerformance: WaiterPerformanceSummary[];
  dailyHistory: DailySalesSummary[];
  hourlyDistribution: { hour: string; sales: number; count: number }[];
}

/**
 * Motor Matemático Determinista de Analítica:
 * IMPORTANTE: Filtra ESTRICTAMENTE órdenes con status == 'pagada'.
 * Órdenes canceladas o mesas aún ocupadas NO suman ni un solo peso al reporte.
 */
export function calculateFinancialAnalytics(allOrders: RestaurantOrder[]): FinancialAnalyticsReport {
  // 1. Filtrar solo órdenes efectivamente pagadas
  const paidOrders = allOrders.filter((o) => o.status === 'pagada');

  if (paidOrders.length === 0) {
    return {
      totalGrossSales: 0,
      totalTipsCollected: 0,
      paidOrdersCount: 0,
      averageTicket: 0,
      salesByPaymentMethod: { efectivo: 0, tarjeta: 0, transferencia: 0 },
      productRanking: [],
      waiterPerformance: [],
      dailyHistory: [],
      hourlyDistribution: [],
    };
  }

  // 2. Ventas totales y propinas
  let totalGrossSales = 0;
  let totalTipsCollected = 0;
  const paymentMethods = { efectivo: 0, tarjeta: 0, transferencia: 0 };
  const productMap = new Map<string, { name: string; units: number; revenue: number }>();
  const waiterMap = new Map<string, { name: string; ordersCount: number; total: number }>();
  const dailyMap = new Map<string, { sales: number; count: number }>();
  const hourlyMap = new Map<number, { sales: number; count: number }>();

  // Inicializar 24 horas del día
  for (let h = 0; h < 24; h++) {
    hourlyMap.set(h, { sales: 0, count: 0 });
  }

  paidOrders.forEach((order) => {
    // Totales
    totalGrossSales += order.subtotal;
    totalTipsCollected += order.tipAmount || 0;

    // Métodos de pago
    if (order.paymentMethod === 'efectivo') paymentMethods.efectivo += order.total;
    else if (order.paymentMethod === 'tarjeta') paymentMethods.tarjeta += order.total;
    else if (order.paymentMethod === 'transferencia') paymentMethods.transferencia += order.total;
    else paymentMethods.efectivo += order.total; // Default

    // Productos vendidos (Snapshot histórico inmutable)
    order.items.forEach((it) => {
      const existing = productMap.get(it.productId) || {
        name: it.productName,
        units: 0,
        revenue: 0,
      };
      existing.units += it.quantity;
      existing.revenue += it.subtotal;
      productMap.set(it.productId, existing);
    });

    // Rendimiento por Mesero
    const waiterId = order.waiterId || 'unknown';
    const existingWaiter = waiterMap.get(waiterId) || {
      name: order.waiterName || 'Mesero',
      ordersCount: 0,
      total: 0,
    };
    existingWaiter.ordersCount += 1;
    existingWaiter.total += order.subtotal;
    waiterMap.set(waiterId, existingWaiter);

    // Agrupación por Día
    const dateKey = order.paidAt ? order.paidAt.slice(0, 10) : order.createdAt.slice(0, 10);
    const existingDay = dailyMap.get(dateKey) || { sales: 0, count: 0 };
    existingDay.sales += order.subtotal;
    existingDay.count += 1;
    dailyMap.set(dateKey, existingDay);

    // Agrupación por Hora
    const orderDate = new Date(order.paidAt || order.createdAt);
    const hour = orderDate.getHours();
    const existingHour = hourlyMap.get(hour) || { sales: 0, count: 0 };
    existingHour.sales += order.subtotal;
    existingHour.count += 1;
    hourlyMap.set(hour, existingHour);
  });

  // Ranking de productos por ingresos
  const productRanking: ProductSalesRanking[] = Array.from(productMap.entries())
    .map(([id, data]) => ({
      productId: id,
      productName: data.name,
      unitsSold: data.units,
      revenueGenerated: data.revenue,
    }))
    .sort((a, b) => b.revenueGenerated - a.revenueGenerated);

  // Rendimiento de meseros
  const waiterPerformance: WaiterPerformanceSummary[] = Array.from(waiterMap.entries())
    .map(([id, data]) => ({
      waiterId: id,
      waiterName: data.name,
      ordersServed: data.ordersCount,
      totalBilled: data.total,
    }))
    .sort((a, b) => b.totalBilled - a.totalBilled);

  // Historial diario
  const dailyHistory: DailySalesSummary[] = Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      grossSales: data.sales,
      ordersCount: data.count,
      averageTicket: Math.round(data.sales / data.count),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Horas pico (filtrar horas con actividad o relevantes entre 11am y 11pm)
  const hourlyDistribution = Array.from(hourlyMap.entries())
    .filter(([h, data]) => h >= 11 && h <= 23)
    .map(([h, data]) => ({
      hour: `${h}:00`,
      sales: data.sales,
      count: data.count,
    }));

  return {
    totalGrossSales,
    totalTipsCollected,
    paidOrdersCount: paidOrders.length,
    averageTicket: Math.round(totalGrossSales / paidOrders.length),
    salesByPaymentMethod: paymentMethods,
    productRanking,
    waiterPerformance,
    dailyHistory,
    hourlyDistribution,
  };
}
