import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlanTier, AuthorizedStaff, UserRole } from '../../domain/models';
import { getCapabilitiesForPlan } from '../../config/capabilities';
import {
  updateRestaurantPlan,
  provisionInitialRestaurant,
  listAuthorizedStaff,
  saveAuthorizedStaffUser,
  toggleAuthorizedStaffActive,
  deleteAuthorizedStaffUser,
} from '../../services/developerService';
import { GlassCard } from '../common/GlassCard';
import {
  ShieldCheck,
  Layers,
  Sparkles,
  CheckCircle2,
  X,
  Users,
  UserPlus,
  Trash2,
  Check,
  AlertCircle,
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'plan' | 'staff'>('plan');
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(currentPlan);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Gestión de Personal
  const [staffList, setStaffList] = useState<AuthorizedStaff[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('waiter');
  const [staffError, setStaffError] = useState<string | null>(null);

  const capabilities = getCapabilitiesForPlan(selectedPlan);

  useEffect(() => {
    if (isOpen) {
      loadStaff();
    }
  }, [isOpen]);

  const loadStaff = async () => {
    try {
      const list = await listAuthorizedStaff();
      setStaffList(list);
    } catch (err) {
      console.error('Error cargando personal:', err);
    }
  };

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
        restaurantName: 'Bistró & Leña · Fuego Sagrado',
      });
      setSuccessMessage('¡Aprovisionamiento inicial completado con éxito!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error en aprovisionamiento:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError(null);
    const email = newEmail.toLowerCase().trim();
    if (!email || !email.includes('@')) {
      setStaffError('Ingresa un correo electrónico válido.');
      return;
    }
    if (!newName.trim()) {
      setStaffError('Ingresa el nombre del colaborador.');
      return;
    }

    setIsUpdating(true);
    try {
      await saveAuthorizedStaffUser(email, newRole, newName.trim(), true);
      setNewEmail('');
      setNewName('');
      setSuccessMessage(`¡Usuario ${email} registrado como ${newRole.toUpperCase()}!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadStaff();
    } catch (err: any) {
      setStaffError(err?.message || 'Error al guardar personal');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleActive = async (email: string, currentActive: boolean) => {
    try {
      await toggleAuthorizedStaffActive(email, !currentActive);
      await loadStaff();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  };

  const handleDeleteStaff = async (email: string) => {
    if (confirm(`¿Revocar acceso y eliminar permanentemente a ${email}?`)) {
      try {
        await deleteAuthorizedStaffUser(email);
        await loadStaff();
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl max-h-[92vh] flex flex-col"
          >
            <GlassCard glow className="border-blue-500/40 p-5 sm:p-6 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Panel de Desarrollador
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        ARSIGEN
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Control de producción, planes y whitelist de accesos</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs de navegación */}
              <div className="flex items-center gap-2 mb-4 p-1 rounded-xl bg-black/40 border border-white/5 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('plan')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'plan'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Planes & Capacidades</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('staff')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'staff'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Personal Autorizado ({staffList.length})</span>
                </button>
              </div>

              {/* Contenido según Tab */}
              <div className="flex-1 overflow-y-auto pr-1 min-h-0">
                {activeTab === 'plan' && (
                  <div className="space-y-4">
                    {/* Selector de Plan */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Plan Contratado en Vivo (Sin Redespliegue)
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['start', 'pro', 'business'] as PlanTier[]).map((tier) => (
                          <button
                            key={tier}
                            type="button"
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
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                      <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <Layers className="w-4 h-4 text-blue-400" />
                        Capacidades del Plan {selectedPlan.toUpperCase()}
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
                  </div>
                )}

                {activeTab === 'staff' && (
                  <div className="space-y-4">
                    {/* Formulario para agregar personal autorizado */}
                    <form onSubmit={handleAddStaff} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-3">
                      <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <UserPlus className="w-3.5 h-3.5 text-blue-400" />
                        <span>Autorizar Nuevo Usuario de Google</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <input
                          type="email"
                          required
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="correo@gmail.com"
                          className="px-3 py-2 rounded-lg bg-slate-900/80 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                        <input
                          type="text"
                          required
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Nombre y apellido"
                          className="px-3 py-2 rounded-lg bg-slate-900/80 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex items-center gap-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as UserRole)}
                            className="flex-1 px-3 py-2 rounded-lg bg-slate-900/80 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                          >
                            <option value="waiter">Mesero</option>
                            <option value="admin">Administrador</option>
                            <option value="developer">Desarrollador</option>
                          </select>
                          <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shrink-0 disabled:opacity-50"
                          >
                            Autorizar
                          </button>
                        </div>
                      </div>

                      {staffError && (
                        <div className="text-rose-400 text-xs flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{staffError}</span>
                        </div>
                      )}
                    </form>

                    {/* Lista de Personal Autorizado */}
                    <div className="space-y-2">
                      {staffList.map((s) => {
                        const isDev = s.role === 'developer';
                        const isAdmin = s.role === 'admin';
                        return (
                          <div
                            key={s.email}
                            className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white truncate">{s.name}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                                    isDev
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                      : isAdmin
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  }`}
                                >
                                  {s.role}
                                </span>
                                {!s.active && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                                    Inactivo
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-400 font-mono text-[11px] truncate mt-0.5">
                                {s.email}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Switch Activo */}
                              <button
                                type="button"
                                onClick={() => handleToggleActive(s.email, s.active)}
                                title={s.active ? 'Desactivar cuenta' : 'Activar cuenta'}
                                className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${
                                  s.active ? 'bg-emerald-500' : 'bg-slate-700'
                                }`}
                              >
                                <div
                                  className={`w-3 h-3 rounded-full bg-white transition-transform ${
                                    s.active ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>

                              {/* Eliminar (protegiendo caro11josue) */}
                              {s.email !== 'caro11josue@gmail.com' && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStaff(s.email)}
                                  className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                                  title="Eliminar usuario"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Mensaje de Éxito */}
              {successMessage && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs font-medium shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                  {successMessage}
                </div>
              )}

              {/* Acciones de pie */}
              <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={handleQuickProvision}
                  disabled={isUpdating}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aprovisionar Restaurante</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Cerrar
                  </button>
                  {activeTab === 'plan' && (
                    <button
                      type="button"
                      onClick={handleApplyPlan}
                      disabled={isUpdating}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
                    >
                      {isUpdating ? 'Actualizando...' : 'Guardar y Aplicar Plan'}
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
