import React, { useState, useEffect } from 'react';
import { PlanTier, RestaurantOrder, RestaurantConfig, RestaurantTable } from '../../domain/models';
import { getCapabilitiesForPlan } from '../../config/capabilities';
import {
  subscribeToOrders,
  markOrderAsPrinted,
  markOrderAsPaid,
} from '../../services/orderService';
import { subscribeToTables } from '../../services/tableService';
import {
  generateInitialComanda,
  generateAdditionComanda,
  generateCustomerBill,
  sendEscPosToPrinter,
  FormattedTicket,
} from '../../services/printerService';
import { formatCurrency } from '../../services/menuService';
import { ReceiptPreviewModal } from './ReceiptPreviewModal';
import { CheckoutModal } from './CheckoutModal';
import { GlassCard } from '../common/GlassCard';
import {
  Printer,
  Bell,
  CheckCircle2,
  Clock,
  DollarSign,
  Receipt,
  AlertTriangle,
  Lock,
  Eye,
  CreditCard,
  User,
} from 'lucide-react';

interface CashierDashboardProps {
  currentPlan: PlanTier;
  config: RestaurantConfig | null;
}

export const CashierDashboard: React.FC<CashierDashboardProps> = ({
  currentPlan,
  config,
}) => {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [activeTicket, setActiveTicket] = useState<FormattedTicket | null>(null);
  const [activeTicketTitle, setActiveTicketTitle] = useState('');
  const [selectedOrderForCheckout, setSelectedOrderForCheckout] = useState<RestaurantOrder | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const capabilities = getCapabilitiesForPlan(currentPlan);

  useEffect(() => {
    const unsubOrders = subscribeToOrders(setOrders);
    const unsubTables = subscribeToTables(setTables);
    return () => {
      unsubOrders();
      unsubTables();
    };
  }, []);

  const unprintedOrders = orders.filter((o) => o.status === 'sin_imprimir');
  const printedActiveOrders = orders.filter((o) => o.status === 'impresa');
  const paidOrders = orders.filter((o) => o.status === 'pagada');

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Imprimir comanda de cocina (Inicial o Adición)
  const handlePrintComanda = async (order: RestaurantOrder) => {
    const ticket = order.isAddition
      ? generateAdditionComanda(order)
      : generateInitialComanda(order);

    const result = await sendEscPosToPrinter(ticket);
    await markOrderAsPrinted(order.id);
    notify(`Comanda Mesa #${order.tableNumber} enviada a cocina (${result.method.toUpperCase()}).`);
  };

  // 2. Pre-visualizar ticket en modal antes de imprimir
  const handlePreviewComanda = (order: RestaurantOrder) => {
    const ticket = order.isAddition
      ? generateAdditionComanda(order)
      : generateInitialComanda(order);
    setActiveTicket(ticket);
    setActiveTicketTitle(`Comanda Cocina - Mesa #${order.tableNumber}`);
  };

  // 3. Imprimir Pre-cuenta de cliente
  const handlePreviewCustomerBill = (order: RestaurantOrder) => {
    const ticket = generateCustomerBill(order, config);
    setActiveTicket(ticket);
    setActiveTicketTitle(`Pre-cuenta de Mesa #${order.tableNumber}`);
  };

  // 4. Cobrar orden
  const handleConfirmPayment = async (
    paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia',
    tipAmount: number
  ) => {
    if (!selectedOrderForCheckout) return;
    await markOrderAsPaid({
      orderId: selectedOrderForCheckout.id,
      tableNumber: selectedOrderForCheckout.tableNumber,
      paymentMethod,
      tipAmount,
    });
    notify(`¡Mesa #${selectedOrderForCheckout.tableNumber} cobrada con éxito y liberada!`);
  };

  // Restricción por plan
  if (!capabilities.allowThermalPrinter) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <GlassCard glow className="border-amber-500/30 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Tablero de Despacho & Impresión POS (Plan Business)
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            La recepción automática de comandas en tiempo real, impresión térmica en 58 mm
            y pre-cuentas de mesa son exclusivas del <strong>Plan Business</strong>.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Comandas sin imprimir */}
        <GlassCard
          className={`p-4 border transition-all ${
            unprintedOrders.length > 0
              ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
              : 'border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl ${
                  unprintedOrders.length > 0
                    ? 'bg-amber-500/30 text-amber-300 animate-pulse'
                    : 'bg-white/5 text-slate-400'
                }`}
              >
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Por Imprimir en Cocina
                </span>
                <div className="text-2xl font-black text-white font-mono">
                  {unprintedOrders.length}
                </div>
              </div>
            </div>
            {unprintedOrders.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/40">
                Alerta
              </span>
            )}
          </div>
        </GlassCard>

        {/* Mesas Activas */}
        <GlassCard className="p-4 border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Mesas en Atención
              </span>
              <div className="text-2xl font-black text-white font-mono">
                {printedActiveOrders.length}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Ventas Hoy */}
        <GlassCard className="p-4 border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cuentas Pagadas Hoy
              </span>
              <div className="text-2xl font-black text-white font-mono">
                {paidOrders.length}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 1: COMANDAS SIN IMPRIMIR (PRIORIDAD ALTA)              */}
      {/* ============================================================== */}
      {unprintedOrders.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <h3 className="text-base font-black text-amber-300 uppercase tracking-wider">
              Nuevas Comandas Entrantes (Sin Imprimir)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unprintedOrders.map((order) => (
              <GlassCard
                key={order.id}
                className="p-4 border-amber-500/50 bg-amber-950/20 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white font-mono">
                      Mesa #{order.tableNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      Orden #{order.dailyNumber || order.id.slice(-4)}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.waiterName}</span>
                  </div>
                </div>

                {/* Ítems */}
                <div className="space-y-1.5 text-xs">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-amber-200">{it.quantity}x </span>
                        <span className="text-white">{it.productName}</span>
                        {it.notes && (
                          <div className="text-[11px] text-amber-400 italic ml-4">
                            ↳ {it.notes}
                          </div>
                        )}
                      </div>
                      <span className="font-mono text-slate-400 shrink-0">
                        {formatCurrency(it.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Acciones de Impresión */}
                <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
                  <button
                    onClick={() => handlePreviewComanda(order)}
                    className="p-2 text-xs text-slate-300 hover:text-white flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ver Ticket</span>
                  </button>

                  <button
                    onClick={() => handlePrintComanda(order)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white text-xs font-bold shadow-lg shadow-amber-500/30 flex items-center gap-2 active:scale-95 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Comanda Cocina (58mm)</span>
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* SECCIÓN 2: MESAS EN ATENCIÓN (IMPRESAS ESPERANDO PAGO)         */}
      {/* ============================================================== */}
      <section className="space-y-3">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Mesas en Consumo / Atención ({printedActiveOrders.length})
        </h3>

        {printedActiveOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {printedActiveOrders.map((order) => (
              <GlassCard key={order.id} className="p-4 border-white/10 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-base font-black text-white font-mono">
                      Mesa #{order.tableNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Impresa en cocina
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                    <span>Atendida por: {order.waiterName}</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {formatCurrency(order.subtotal)}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-400 line-clamp-2">
                    {order.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => handlePreviewCustomerBill(order)}
                    className="flex-1 py-2 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Pre-cuenta</span>
                  </button>

                  <button
                    onClick={() => setSelectedOrderForCheckout(order)}
                    className="flex-1 py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Cobrar Mesa</span>
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 rounded-2xl border border-dashed border-white/10 text-slate-500 text-xs">
            No hay mesas en consumo en este momento. Las órdenes enviadas por los meseros aparecerán aquí.
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* MODALES: TICKET PREVIEW & CHECKOUT                             */}
      {/* ============================================================== */}
      <ReceiptPreviewModal
        isOpen={!!activeTicket}
        ticket={activeTicket}
        ticketTitle={activeTicketTitle}
        onClose={() => setActiveTicket(null)}
        onConfirmPrint={async () => {
          if (activeTicket) {
            await sendEscPosToPrinter(activeTicket);
            notify('Enviado a la impresora térmica POS-5890U-L.');
            setActiveTicket(null);
          }
        }}
      />

      <CheckoutModal
        isOpen={!!selectedOrderForCheckout}
        order={selectedOrderForCheckout}
        onClose={() => setSelectedOrderForCheckout(null)}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
};
