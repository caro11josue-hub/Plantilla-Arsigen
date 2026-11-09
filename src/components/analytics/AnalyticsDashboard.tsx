import React, { useState, useEffect } from 'react';
import { PlanTier, RestaurantOrder } from '../../domain/models';
import { getCapabilitiesForPlan } from '../../config/capabilities';
import { subscribeToOrders } from '../../services/orderService';
import { calculateFinancialAnalytics, FinancialAnalyticsReport } from '../../services/analyticsCalculator';
import { formatCurrency } from '../../services/menuService';
import { GlassCard } from '../common/GlassCard';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Users,
  Award,
  CreditCard,
  Banknote,
  Smartphone,
  Clock,
  Lock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  currentPlan: PlanTier;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ currentPlan }) => {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);

  const capabilities = getCapabilitiesForPlan(currentPlan);

  useEffect(() => {
    const unsub = subscribeToOrders(setOrders);
    return () => unsub();
  }, []);

  const report: FinancialAnalyticsReport = calculateFinancialAnalytics(orders);

  if (!capabilities.allowFinancialStats) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <GlassCard glow className="border-amber-500/30 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Módulo de Estadísticas Financieras (Plan Business)
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Las estadísticas matemáticas en tiempo real, ticket promedio, horas pico y ranking de platos
            son exclusivas del <strong>Plan Business</strong>.
          </p>
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-400 max-w-md mx-auto text-left space-y-2">
            <div className="font-bold text-slate-200 uppercase tracking-wider">
              Garantías del Motor Estadístico:
            </div>
            <div>• Opera únicamente sobre pedidos con estado "pagada".</div>
            <div>• Precios netos reales (sin desgloses de IVA ni cálculos inventados).</div>
            <div>• Datos históricos 100% congelados e inmutables.</div>
          </div>
        </GlassCard>
      </div>
    );
  }

  const totalPayments =
    report.salesByPaymentMethod.efectivo +
    report.salesByPaymentMethod.tarjeta +
    report.salesByPaymentMethod.transferencia;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            Tablero Financiero & Estadísticas Auditadas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas matemáticas exactas basadas exclusivamente en pedidos efectivamente pagados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Datos Inmutables
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ventas Totales */}
        <GlassCard glow className="p-4 border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ventas Cobradas
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {formatCurrency(report.totalGrossSales)}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            {report.paidOrdersCount} cuentas finalizadas
          </div>
        </GlassCard>

        {/* Ticket Promedio */}
        <GlassCard className="p-4 border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ticket Promedio
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-2">
            {formatCurrency(report.averageTicket)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Por mesa atendida
          </div>
        </GlassCard>

        {/* Propinas Recaudadas */}
        <GlassCard className="p-4 border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Propinas Equipo
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono mt-2">
            {formatCurrency(report.totalTipsCollected)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Sugerida 10% voluntaria
          </div>
        </GlassCard>

        {/* Cuentas Pagadas */}
        <GlassCard className="p-4 border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Rotación de Mesas
            </span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {report.paidOrdersCount}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Cuentas cerradas
          </div>
        </GlassCard>
      </div>

      {/* Métodos de Pago & Horas Pico */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribución Métodos de Pago */}
        <GlassCard className="p-5 border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-400" />
            Distribución por Método de Pago
          </h3>

          <div className="space-y-3">
            {/* Efectivo */}
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-emerald-400" /> Efectivo
                </span>
                <span className="font-mono font-bold">{formatCurrency(report.salesByPaymentMethod.efectivo)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalPayments > 0 ? (report.salesByPaymentMethod.efectivo / totalPayments) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Tarjeta */}
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" /> Tarjeta (Datáfono)
                </span>
                <span className="font-mono font-bold">{formatCurrency(report.salesByPaymentMethod.tarjeta)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalPayments > 0 ? (report.salesByPaymentMethod.tarjeta / totalPayments) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Transferencia */}
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-purple-400" /> Transferencia / QR
                </span>
                <span className="font-mono font-bold">{formatCurrency(report.salesByPaymentMethod.transferencia)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalPayments > 0 ? (report.salesByPaymentMethod.transferencia / totalPayments) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Productividad por Mesero */}
        <GlassCard className="p-5 border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Productividad del Personal de Salón
          </h3>

          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {report.waiterPerformance.map((w, idx) => (
              <div
                key={w.waiterId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px]">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-white">{w.waiterName}</div>
                    <div className="text-[10px] text-slate-400">{w.ordersServed} mesas cobradas</div>
                  </div>
                </div>

                <div className="font-mono text-cyan-400 font-bold text-xs">
                  {formatCurrency(w.totalBilled)}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Ranking de Platos Más Vendidos */}
      <GlassCard className="p-5 border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          Ranking de Platos por Facturación
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {report.productRanking.slice(0, 6).map((item, idx) => (
            <div
              key={item.productId}
              className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-400">#{idx + 1}</span>
                  <span className="font-bold text-white truncate">{item.productName}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {item.unitsSold} unidades despachadas
                </div>
              </div>

              <div className="font-mono font-bold text-emerald-400 shrink-0">
                {formatCurrency(item.revenueGenerated)}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
