import React, { useState, useEffect } from 'react';
import { PlanTier, UserRole, RestaurantConfig } from './domain/models';
import { getCapabilitiesForPlan } from './config/capabilities';
import { getRestaurantConfig } from './services/developerService';
import { useStealthTrigger } from './hooks/useStealthTrigger';
import { GlassCard } from './components/common/GlassCard';
import { DeveloperModal } from './components/developer/DeveloperModal';
import { DeveloperFloatingTrigger } from './components/developer/DeveloperFloatingTrigger';
import { AuthModal } from './components/auth/AuthModal';
import { CustomerMenuView } from './components/menu/CustomerMenuView';
import { AdminMenuPanel } from './components/admin/AdminMenuPanel';
import {
  Sparkles,
  UtensilsCrossed,
  Printer,
  TrendingUp,
  LayoutGrid,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  QrCode,
  Layers,
  Flame,
  KeyRound,
  ExternalLink,
  Eye,
  Sliders,
} from 'lucide-react';

type ActiveViewMode = 'customer' | 'admin' | 'waiter' | 'matrix';

export const App: React.FC = () => {
  const [config, setConfig] = useState<RestaurantConfig | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('business');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [viewMode, setViewMode] = useState<ActiveViewMode>('customer');
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Cargar configuración inicial
  useEffect(() => {
    getRestaurantConfig().then((cfg) => {
      setConfig(cfg);
      if (cfg?.plan) {
        setCurrentPlan(cfg.plan);
      }
    });
  }, []);

  // Hook de sigilo: 3 clics en logo + tecla [ESPACIO]
  const stealthTrigger = useStealthTrigger({
    requiredClicks: 3,
    timeWindowMs: 2500,
    requireSpaceKey: true,
    onTrigger: () => {
      setIsAuthModalOpen(true);
    },
  });

  const capabilities = getCapabilitiesForPlan(currentPlan);

  const handlePlanChanged = (newPlan: PlanTier) => {
    setCurrentPlan(newPlan);
  };

  const handleRoleChanged = (role: UserRole | null) => {
    setUserRole(role);
    if (role === 'admin') setViewMode('admin');
    else if (role === 'waiter') setViewMode('waiter');
    else setViewMode('customer');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col relative selection:bg-blue-600/30 selection:text-blue-200">
      {/* Background ambient glowing gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Top Bar de Navegación & Control */}
      <header className="relative z-30 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-xl sticky top-0 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo con trigger de sigilo inerte en toques 1 y 2 */}
          <div
            onClick={stealthTrigger.registerClick}
            className="cursor-pointer select-none flex items-center gap-2.5 p-1 rounded-xl"
            title="Logo de restaurante (Gatillo de 3 toques)"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>{config?.restaurantName || 'Sabor & Fuego Bistro'}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                  {currentPlan}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                ARSIGEN GastroPOS Engine
              </div>
            </div>
          </div>
        </div>

        {/* Selector de Perspectivas para verificación de desarrollo */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setViewMode('customer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'customer'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Menú Comensal
          </button>
          <button
            onClick={() => setViewMode('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'admin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            Panel Admin
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'matrix'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Matriz del Plan
          </button>
        </div>

        {/* Acciones de Autenticación & Desarrollador */}
        <div className="flex items-center gap-2">
          {userRole ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {userRole === 'admin' ? 'Administrador' : 'Mesero'}
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              Staff
            </button>
          )}

          <button
            onClick={() => setIsDevModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Plan: {currentPlan.toUpperCase()}
          </button>
        </div>
      </header>

      {/* Banner de espera de tecla Espacio (sigilo 3 toques) */}
      {stealthTrigger.awaitingSpace && (
        <div className="relative z-30 bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-200 font-semibold flex items-center justify-center gap-2 animate-pulse">
          <span>⚡ 3 toques detectados en el logo: Presiona [ESPACIO] para abrir panel de staff</span>
          <button
            onClick={stealthTrigger.triggerDirectly}
            className="ml-2 underline text-amber-100 hover:text-white"
          >
            (o pulsa aquí)
          </button>
        </div>
      )}

      {/* Vistas Principales */}
      <div className="relative z-10 flex-1">
        {viewMode === 'customer' ? (
          <CustomerMenuView
            config={config}
            currentPlan={currentPlan}
            onLogoStealthClick={stealthTrigger.registerClick}
            awaitingSpace={stealthTrigger.awaitingSpace}
          />
        ) : viewMode === 'admin' ? (
          <AdminMenuPanel
            config={config}
            currentPlan={currentPlan}
            onConfigUpdated={(newCfg) => setConfig(newCfg)}
          />
        ) : (
          /* Vista Técnica de Matriz de Capacidades */
          <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard glow className="md:col-span-2 border-blue-500/30 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    Fases 1 & 2: Motor Base + Menú Comensal
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Plataforma Unificada Multi-Nivel
                  </h1>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    Menú interactivo con estética Dark Glassmorphism, categorías SVG, búsqueda en tiempo real
                    y control dinámico por capacidades. Plan activo actual:{' '}
                    <strong className="text-blue-400 uppercase">{currentPlan}</strong>.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>React 19 + TypeScript</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Tailwind CSS v4 Glassmorphism</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span>Iconos SVG Vectoriales (Sin Emojis)</span>
                  </div>
                </div>
              </GlassCard>

              {/* Selector Rápido de Plan */}
              <GlassCard className="flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Cambio Rápido de Plan
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Altera el plan para ver cómo se adapta la experiencia del comensal:
                  </p>
                  <div className="space-y-2">
                    {(['start', 'pro', 'business'] as PlanTier[]).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => handlePlanChanged(tier)}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all border ${
                          currentPlan === tier
                            ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/30'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span>Plan {tier}</span>
                        <span className="text-[10px] font-mono opacity-80 lowercase">
                          {tier === 'start' && '35 ítems'}
                          {tier === 'pro' && '50 ítems + admin'}
                          {tier === 'business' && '70 mesas + POS'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-center">
                  <button
                    onClick={() => setViewMode('customer')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4"
                  >
                    Volver a Vista Menú Comensal →
                  </button>
                </div>
              </GlassCard>
            </div>

            {/* Matriz de Capacidades */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-400" />
                    Capacidades Activas ({currentPlan.toUpperCase()})
                  </h2>
                </div>
                <div className="text-xs font-mono px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300">
                  Límite: {capabilities.maxProducts === 9999 ? 'Ilimitado' : `${capabilities.maxProducts} platos`}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <GlassCard className="p-4 border-white/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Menú Digital QR</h4>
                        <p className="text-xs text-slate-400">Visualización cliente</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  </div>
                </GlassCard>

                <GlassCard className="p-4 border-white/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                        <UtensilsCrossed className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Edición por Administrador</h4>
                        <p className="text-xs text-slate-400">Precios y disponibilidad</p>
                      </div>
                    </div>
                    {capabilities.allowAdminMenuEdit ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-600 shrink-0" />
                    )}
                  </div>
                </GlassCard>

                <GlassCard className="p-4 border-white/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                        <LayoutGrid className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Módulo de Salón & Meseros</h4>
                        <p className="text-xs text-slate-400">Toma de comandas</p>
                      </div>
                    </div>
                    {capabilities.allowWaiterModule ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-600 shrink-0" />
                    )}
                  </div>
                </GlassCard>

                <GlassCard className="p-4 border-white/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                        <Printer className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Impresora POS-5890U-L</h4>
                        <p className="text-xs text-slate-400">ESC/POS 58mm (32 columnas)</p>
                      </div>
                    </div>
                    {capabilities.allowThermalPrinter ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-600 shrink-0" />
                    )}
                  </div>
                </GlassCard>

                <GlassCard className="p-4 border-white/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Estadísticas Reales</h4>
                        <p className="text-xs text-slate-400">Auditadas sin IVA</p>
                      </div>
                    </div>
                    {capabilities.allowFinancialStats ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-600 shrink-0" />
                    )}
                  </div>
                </GlassCard>

                <GlassCard className="p-4 border-white/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Reseña Google Maps</h4>
                        <p className="text-xs text-slate-400">Conversión comensales</p>
                      </div>
                    </div>
                    {capabilities.allowSocialLinks ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-600 shrink-0" />
                    )}
                  </div>
                </GlassCard>
              </div>
            </section>
          </main>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 px-4 text-center text-xs text-slate-500">
        <div>ARSIGEN GastroPOS Platform · Menú Digital y Sistema Unificado · 2026</div>
        <div className="mt-1 text-[11px] text-slate-600">
          Estándar de calidad SDD (SRS, SAS, DBS, BRP y Roadmap v1.1.0)
        </div>
      </footer>

      {/* Botón Flotante de Desarrollador */}
      <DeveloperFloatingTrigger
        currentPlan={currentPlan}
        onClick={() => setIsDevModalOpen(true)}
      />

      {/* Modal de Desarrollador */}
      <DeveloperModal
        isOpen={isDevModalOpen}
        currentPlan={currentPlan}
        onClose={() => setIsDevModalOpen(false)}
        onPlanChanged={handlePlanChanged}
      />

      {/* Modal de Acceso de Personal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        currentUserRole={userRole}
        onClose={() => setIsAuthModalOpen(false)}
        onRoleChanged={handleRoleChanged}
      />
    </div>
  );
};

export default App;
