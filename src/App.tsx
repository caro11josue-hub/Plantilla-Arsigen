import React, { useState, useEffect } from 'react';
import { PlanTier, UserRole, RestaurantConfig } from './domain/models';
import { getCapabilitiesForPlan } from './config/capabilities';
import { getRestaurantConfig } from './services/developerService';
import { useStealthTrigger } from './hooks/useStealthTrigger';
import { GlassCard } from './components/common/GlassCard';
import { DeveloperModal } from './components/developer/DeveloperModal';
import { DeveloperFloatingTrigger } from './components/developer/DeveloperFloatingTrigger';
import { AuthModal } from './components/auth/AuthModal';
import {
  Sparkles,
  UtensilsCrossed,
  Printer,
  TrendingUp,
  LayoutGrid,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  QrCode,
  Layers,
  Flame,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

export const App: React.FC = () => {
  const [config, setConfig] = useState<RestaurantConfig | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('business'); // Inicializar con business para ver todas las capacidades en dev
  const [userRole, setUserRole] = useState<UserRole | null>(null);
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

  // Hook de sigilo de 3 toques + espacio en el logo
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

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col relative selection:bg-blue-600/30 selection:text-blue-200">
      {/* Background ambient glowing gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header / Navbar */}
      <header className="relative z-10 border-b border-white/10 bg-[#0f172a]/70 backdrop-blur-xl sticky top-0 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo con trigger de sigilo de 3 toques */}
          <div
            onClick={stealthTrigger.registerClick}
            className="cursor-pointer select-none flex items-center gap-2.5 p-1 rounded-xl transition-all"
            title="Logo de restaurante"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                {config?.restaurantName || 'Sabor & Tradición'}
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                  {currentPlan}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                ARSIGEN GastroPOS Engine
              </div>
            </div>
          </div>
        </div>

        {/* Status badges & Actions */}
        <div className="flex items-center gap-3">
          {userRole ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Rol: {userRole.toUpperCase()}
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              Acceso Staff
            </button>
          )}

          <button
            onClick={() => setIsDevModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Control de Plan
          </button>
        </div>
      </header>

      {/* Banner de espera de tecla Espacio (para feedback en testing) */}
      {stealthTrigger.awaitingSpace && (
        <div className="relative z-20 bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-200 font-semibold flex items-center justify-center gap-2 animate-pulse">
          <span>⚡ 3 toques detectados en el logo: Presiona [ESPACIO] para abrir acceso de personal</span>
          <button
            onClick={stealthTrigger.triggerDirectly}
            className="ml-2 underline text-amber-100 hover:text-white"
          >
            (o haz clic aquí)
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Hero status card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard glow className="md:col-span-2 border-blue-500/30 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Fase 1: Motor Base & Matriz de Capacidades
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Plataforma Unificada Multi-Nivel
              </h1>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Código fuente maestro con activación dinámica por capacidades (Feature Flags). El plan actual es{' '}
                <strong className="text-blue-400 uppercase">{currentPlan}</strong>. Las vistas, permisos y
                módulos se adaptan en caliente sin alterar la base de datos ni requerir nuevos despliegues.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>React 19 + TypeScript + Vite</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Tailwind CSS v4 Glassmorphism</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Caché Offline Firestore Activa</span>
              </div>
            </div>
          </GlassCard>

          {/* Quick Plan Switcher Widget */}
          <GlassCard className="flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Cambio Rápido de Plan
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Prueba en vivo cómo reacciona la interfaz según el plan contratado por el restaurante:
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
                onClick={() => setIsDevModalOpen(true)}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4"
              >
                Abrir Administrador del Sistema →
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Live Capabilities Matrix */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Matriz de Capacidades Activas
              </h2>
              <p className="text-xs text-slate-400">
                Reglas de negocio y módulos habilitados en tiempo de ejecución para el plan seleccionado.
              </p>
            </div>
            <div className="text-xs font-mono px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300">
              Límite Menú: {capabilities.maxProducts === 9999 ? 'Ilimitado' : `${capabilities.maxProducts} ítems`} | Mesas:{' '}
              {capabilities.maxTables === 0 ? 'Sin módulo mesas' : `Hasta ${capabilities.maxTables}`}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Capability 1 */}
            <GlassCard className="p-4 border-white/5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Menú Digital QR</h4>
                    <p className="text-xs text-slate-400">Visualización interactiva cliente</p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>
              <div className="mt-3 text-[11px] text-slate-400">
                Disponible en todos los planes con sincronización instantánea y modo offline.
              </div>
            </GlassCard>

            {/* Capability 2 */}
            <GlassCard className="p-4 border-white/5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Edición por Administrador</h4>
                    <p className="text-xs text-slate-400">Precios, descripción y disponibilidad</p>
                  </div>
                </div>
                {capabilities.allowAdminMenuEdit ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-600 shrink-0" />
                )}
              </div>
              <div className="mt-3 text-[11px] text-slate-400">
                {capabilities.allowAdminMenuEdit
                  ? 'Activo: El dueño del restaurante puede modificar platos y precios sin ayuda externa.'
                  : 'Deshabilitado en Plan Start: Las modificaciones las gestiona ARSIGEN mediante soporte.'}
              </div>
            </GlassCard>

            {/* Capability 3 */}
            <GlassCard className="p-4 border-white/5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Módulo Salón y Meseros</h4>
                    <p className="text-xs text-slate-400">Toma de pedidos en 3 espacios</p>
                  </div>
                </div>
                {capabilities.allowWaiterModule ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-600 shrink-0" />
                )}
              </div>
              <div className="mt-3 text-[11px] text-slate-400">
                {capabilities.allowWaiterModule
                  ? 'Activo: Meseros ilimitados con vista de 70 mesas, comanda y adiciones.'
                  : 'Exclusivo del Plan Business: No disponible en Start ni Pro.'}
              </div>
            </GlassCard>

            {/* Capability 4 */}
            <GlassCard className="p-4 border-white/5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Impresora POS-5890U-L</h4>
                    <p className="text-xs text-slate-400">ESC/POS 58mm (32 col) Bluetooth</p>
                  </div>
                </div>
                {capabilities.allowThermalPrinter ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-600 shrink-0" />
                )}
              </div>
              <div className="mt-3 text-[11px] text-slate-400">
                {capabilities.allowThermalPrinter
                  ? 'Activo: Impresión de comanda inicial, adiciones y pre-cuenta sin recálculo de IVA.'
                  : 'Exclusivo del Plan Business con soporte Web Bluetooth & Web Serial.'}
              </div>
            </GlassCard>

            {/* Capability 5 */}
            <GlassCard className="p-4 border-white/5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Estadísticas Reales</h4>
                    <p className="text-xs text-slate-400">Ventas, platos top y métricas diarias</p>
                  </div>
                </div>
                {capabilities.allowFinancialStats ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-600 shrink-0" />
                )}
              </div>
              <div className="mt-3 text-[11px] text-slate-400">
                {capabilities.allowFinancialStats
                  ? 'Activo: Basado únicamente en pedidos con estado pagada (datos 100% auditables).'
                  : 'Disponible en Plan Business: Métricas gerenciales para el propietario.'}
              </div>
            </GlassCard>

            {/* Capability 6 */}
            <GlassCard className="p-4 border-white/5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Redes & Reseña Google Maps</h4>
                    <p className="text-xs text-slate-400">Enlaces y conversión de clientes</p>
                  </div>
                </div>
                {capabilities.allowSocialLinks ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-600 shrink-0" />
                )}
              </div>
              <div className="mt-3 text-[11px] text-slate-400">
                {capabilities.allowSocialLinks
                  ? 'Activo: Botón directo a Google Maps, Instagram y WhatsApp del restaurante.'
                  : 'Deshabilitado en Plan Start genérico.'}
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Roadmap Roadmap Tracker */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Progreso del Roadmap de Implementación (ARSIGEN SDD)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-200">
              <div className="font-bold uppercase tracking-wider text-[11px]">Fase 1: Motor Base</div>
              <div className="text-emerald-400 font-semibold mt-1">✓ Completada</div>
              <p className="text-[11px] text-slate-300 mt-1">Configuración, modelos, matriz de capacidades y panel dev.</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-300">
              <div className="font-bold uppercase tracking-wider text-[11px]">Fase 2: Menú Digital</div>
              <div className="text-blue-400 font-semibold mt-1">Siguiente fase</div>
              <p className="text-[11px] text-slate-400 mt-1">Vista comensal, categorías SVG, fotos, buscador y sincronización.</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-300">
              <div className="font-bold uppercase tracking-wider text-[11px]">Fase 3: Panel Admin Menú</div>
              <div className="text-slate-500 font-semibold mt-1">Plan Pro / Business</div>
              <p className="text-[11px] text-slate-400 mt-1">Edición en línea, subida de fotos, pausa de stock en 1 toque.</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-300">
              <div className="font-bold uppercase tracking-wider text-[11px]">Fases 4-7: POS & Hardware</div>
              <div className="text-slate-500 font-semibold mt-1">Plan Business</div>
              <p className="text-[11px] text-slate-400 mt-1">Mesas, comandas en tiempo real, ESC/POS 58mm y estadísticas.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 px-4 text-center text-xs text-slate-500">
        <div>ARSIGEN GastroPOS Platform · Arquitectura Monocódigo Multi-Plan · 2026</div>
        <div className="mt-1 text-[11px] text-slate-600">
          Diseñado bajo especificaciones SDD (SRS, SAS, DBS, BRP y Roadmap v1.1.0)
        </div>
      </footer>

      {/* Floating Developer Button */}
      <DeveloperFloatingTrigger
        currentPlan={currentPlan}
        onClick={() => setIsDevModalOpen(true)}
      />

      {/* Developer Modal */}
      <DeveloperModal
        isOpen={isDevModalOpen}
        currentPlan={currentPlan}
        onClose={() => setIsDevModalOpen(false)}
        onPlanChanged={handlePlanChanged}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        currentUserRole={userRole}
        onClose={() => setIsAuthModalOpen(false)}
        onRoleChanged={(role) => setUserRole(role)}
      />
    </div>
  );
};

export default App;
