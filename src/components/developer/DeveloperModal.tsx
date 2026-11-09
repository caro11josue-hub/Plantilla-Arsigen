import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlanTier } from '../../domain/models';
import { getCapabilitiesForPlan } from '../../config/capabilities';
import { updateRestaurantPlan, provisionInitialRestaurant } from '../../services/developerService';
import { GlassCard } from '../common/GlassCard';
import { ShieldCheck, Layers, Sparkles, CheckCircle2, X } from 'lucide-react';

interface DeveloperModalProps {
  isOpen: boolean;
  currentPlan: PlanTier;
  onClose: () => void;
  onPlanChanged: (newPlan: PlanTier) => void;
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({
  isOpen,
  currentPlan,
  onClose,
  onPlanChanged,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(currentPlan);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const capabilities = getCapabilitiesForPlan(selectedPlan);

  const handleApplyPlan = async () => {
    setIsUpdating(true);
    try {
      await updateRestaurantPlan(selectedPlan);
      onPlanChanged(selectedPlan);
      setSuccessMessage(`¡Plan cambiado con éxito a ${selectedPlan.toUpperCase()}!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error al actualizar plan:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickProvision = async () => {
    setIsUpdating(true);
    try {
      await provisionInitialRestaurant({
        plan: selectedPlan,
        restaurantName: 'Sabor Artesanal Bistro',
      });
      setSuccessMessage('¡Aprovisionamiento inicial completado con éxito!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error en aprovisionamiento:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl"
          >
            <GlassCard glow className="border-blue-500/40">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Panel de Desarrollador (ARSIGEN)</h3>
                    <p className="text-xs text-slate-400">Control de producción y matriz de capacidades</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selector de Plan */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Plan Contratado en Vivo (Sin Redespliegue)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['start', 'pro', 'business'] as PlanTier[]).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setSelectedPlan(tier)}
                      className={`py-3 px-4 rounded-xl text-center font-medium text-sm transition-all border ${
                        selectedPlan === tier
                          ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="uppercase tracking-wide font-bold">{tier}</div>
                      <div className="text-[11px] opacity-75 mt-0.5">
                        {tier === 'start' && '35 ítems'}
                        {tier === 'pro' && '50 ítems · Admin'}
                        {tier === 'business' && '70 mesas · POS'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Matriz de Capacidades Activas */}
              <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Capacidades del Plan Seleccionado
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className={capabilities.allowAdminMenuEdit ? 'text-emerald-400' : 'text-slate-600'}>
                      ●
                    </span>
                    Edición de menú por Admin
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className={capabilities.allowStockToggle ? 'text-emerald-400' : 'text-slate-600'}>
                      ●
                    </span>
                    Pausa de stock en 1 toque
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className={capabilities.allowWaiterModule ? 'text-emerald-400' : 'text-slate-600'}>
                      ●
                    </span>
                    Módulo de salón / Meseros
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className={capabilities.allowKitchenComandas ? 'text-emerald-400' : 'text-slate-600'}>
                      ●
                    </span>
                    Comandas en tiempo real
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className={capabilities.allowThermalPrinter ? 'text-emerald-400' : 'text-slate-600'}>
                      ●
                    </span>
                    Impresora POS-5890U-L (58mm)
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className={capabilities.allowFinancialStats ? 'text-emerald-400' : 'text-slate-600'}>
                      ●
                    </span>
                    Estadísticas reales auditadas
                  </div>
                </div>
              </div>

              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  {successMessage}
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleQuickProvision}
                  disabled={isUpdating}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Aprovisionar Restaurante
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={handleApplyPlan}
                    disabled={isUpdating}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
                  >
                    {isUpdating ? 'Actualizando...' : 'Guardar y Aplicar Plan'}
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
