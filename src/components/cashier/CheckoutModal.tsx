import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RestaurantOrder } from '../../domain/models';
import { formatCurrency } from '../../services/menuService';
import { GlassCard } from '../common/GlassCard';
import { X, CheckCircle, CreditCard, Banknote, Smartphone, DollarSign } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  order: RestaurantOrder | null;
  onClose: () => void;
  onConfirmPayment: (paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia', tipAmount: number) => Promise<void>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  order,
  onClose,
  onConfirmPayment,
}) => {
  const [includeTip, setIncludeTip] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !order) return null;

  const tip10 = includeTip ? Math.round(order.subtotal * 0.10) : 0;
  const grandTotal = order.subtotal + tip10;
  const changeDue = Math.max(0, (cashReceived || 0) - grandTotal);

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      await onConfirmPayment(paymentMethod, tip10);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md"
        >
          <GlassCard glow className="border-emerald-500/30 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Cobro de Mesa #{order.tableNumber}
                </span>
                <h3 className="text-lg font-black text-white">Finalizar y Liberar Mesa</h3>
              </div>
              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Desglose Económico */}
            <div className="space-y-2 p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal Consumo (IVA incl.):</span>
                <span className="font-mono font-bold text-white">{formatCurrency(order.subtotal)}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeTip}
                    onChange={(e) => setIncludeTip(e.target.checked)}
                    className="rounded bg-slate-800 border-white/20 text-emerald-500"
                  />
                  <span>Propina sugerida voluntaria (10%):</span>
                </label>
                <span className="font-mono font-bold text-emerald-400">+{formatCurrency(tip10)}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm font-black">
                <span className="text-white">TOTAL A COBRAR:</span>
                <span className="font-mono text-cyan-400 text-base">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Selector de Método de Pago */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Método de Pago
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('efectivo')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    paymentMethod === 'efectivo'
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Efectivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('tarjeta')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    paymentMethod === 'tarjeta'
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Tarjeta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('transferencia')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    paymentMethod === 'transferencia'
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Transferencia</span>
                </button>
              </div>
            </div>

            {/* Calculadora de Vueltas / Cambio si es en efectivo */}
            {paymentMethod === 'efectivo' && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Efectivo Recibido:</span>
                  <input
                    type="number"
                    step={1000}
                    value={cashReceived || ''}
                    onChange={(e) => setCashReceived(Number(e.target.value))}
                    placeholder="Monto entregado..."
                    className="w-32 px-2.5 py-1 text-right font-mono text-white bg-black/40 rounded-lg border border-white/10 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {cashReceived > 0 && (
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 font-bold">
                    <span className="text-slate-300">Cambio a Entregar:</span>
                    <span className="font-mono text-emerald-400">{formatCurrency(changeDue)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isProcessing ? 'Procesando...' : 'Confirmar Pago & Liberar Mesa'}</span>
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
