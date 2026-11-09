import React, { useState, useEffect } from 'react';
import { PlanTier, UserRole, RestaurantConfig, AuthorizedStaff } from './domain/models';
import { getCapabilitiesForPlan } from './config/capabilities';
import { getRestaurantConfig } from './services/developerService';
import { subscribeToAuthState, logout } from './services/authService';
import { useStealthTrigger } from './hooks/useStealthTrigger';
import { DeveloperModal } from './components/developer/DeveloperModal';
import { AuthModal } from './components/auth/AuthModal';
import { CustomerMenuView } from './components/menu/CustomerMenuView';
import { AdminMenuPanel } from './components/admin/AdminMenuPanel';
import { WaiterModuleView } from './components/waiter/WaiterModuleView';
import { CashierDashboard } from './components/cashier/CashierDashboard';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import {
  UtensilsCrossed,
  Printer,
  TrendingUp,
  LayoutGrid,
  ShieldCheck,
  Eye,
  LogOut,
  Flame,
} from 'lucide-react';

type AdminViewTab = 'menu' | 'cashier' | 'analytics' | 'customer';

export const App: React.FC = () => {
  const [config, setConfig] = useState<RestaurantConfig | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('business');
  const [staffUser, setStaffUser] = useState<AuthorizedStaff | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [adminTab, setAdminTab] = useState<AdminViewTab>('menu');
  const [waiterViewMode, setWaiterViewMode] = useState<'waiter' | 'customer'>('waiter');
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Cargar configuración general del restaurante en tiempo real
  useEffect(() => {
    getRestaurantConfig().then((cfg) => {
      setConfig(cfg);
      if (cfg?.plan) {
        setCurrentPlan(cfg.plan);
      }
    });
  }, []);

  // Escuchar estado de sesión autenticada con Google contra authorized_staff
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((staff) => {
      setStaffUser(staff);
      setUserRole(staff?.role || null);
    });
    return () => unsubscribe();
  }, []);

  // Gatillo de sigilo: 3 clics rápidos sobre el logo (<1000ms) abren el modal de acceso de personal
  const stealthTrigger = useStealthTrigger({
    requiredClicks: 3,
    timeWindowMs: 1200,
    requireSpaceKey: false,
    onTrigger: () => {
      setIsAuthModalOpen(true);
    },
  });

  const capabilities = getCapabilitiesForPlan(currentPlan);

  const handlePlanChanged = (newPlan: PlanTier) => {
    setCurrentPlan(newPlan);
  };

  const handleRoleChanged = (role: UserRole | null, email?: string | null) => {
    setUserRole(role);
    if (role && email) {
      setStaffUser((prev) => (prev ? { ...prev, role, email } : null));
    } else if (!role) {
      setStaffUser(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    setStaffUser(null);
    setUserRole(null);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col relative selection:bg-amber-600/30 selection:text-amber-200">
      {/* Resplandor ambiental de brasas */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-amber-800/10 rounded-full blur-3xl" />
      </div>

      {/* BARRA SUPERIOR DE PERSONAL AUTENTICADO: ÚNICAMENTE VISIBLE SI EXISTE ROL AUTORIZADO */}
      {userRole && (
        <header className="relative z-30 border-b border-amber-500/20 bg-[#0d1117]/95 backdrop-blur-xl sticky top-0 px-4 lg:px-8 py-2.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">
                  {config?.restaurantName || 'Bistró & Leña'}
                </div>
                <div className="text-[10px] text-amber-300/80 font-mono">
                  {staffUser?.name || staffUser?.email || 'Personal Autorizado'}
                </div>
              </div>
            </div>

            {/* Badge de Rol */}
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                userRole === 'developer'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : userRole === 'admin'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {userRole === 'developer'
                ? 'Desarrollador ARSIGEN'
                : userRole === 'admin'
                ? 'Administrador'
                : 'Mesero'}
            </span>
          </div>

          {/* Navegación interna exclusiva de Administrador / Desarrollador */}
          {(userRole === 'admin' || userRole === 'developer') && (
            <div className="hidden md:flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setAdminTab('menu')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  adminTab === 'menu'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                Gestión Menú
              </button>

              {capabilities.allowKitchenComandas && (
                <button
                  onClick={() => setAdminTab('cashier')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    adminTab === 'cashier'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  Caja & POS
                </button>
              )}

              {capabilities.allowFinancialStats && (
                <button
                  onClick={() => setAdminTab('analytics')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    adminTab === 'analytics'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Estadísticas
                </button>
              )}

              <button
                onClick={() => setAdminTab('customer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  adminTab === 'customer'
                    ? 'bg-white/20 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Ver Carta Comensal
              </button>
            </div>
          )}

          {/* Navegación interna para Mesero */}
          {userRole === 'waiter' && (
            <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setWaiterViewMode('waiter')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  waiterViewMode === 'waiter'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Salón & Mesas
              </button>
              <button
                onClick={() => setWaiterViewMode('customer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  waiterViewMode === 'customer'
                    ? 'bg-white/20 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Ver Carta
              </button>
            </div>
          )}

          {/* Botones de Desarrollador y Cerrar Sesión */}
          <div className="flex items-center gap-2">
            {userRole === 'developer' && (
              <button
                onClick={() => setIsDevModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                <span>Panel Dev</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-medium transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>
      )}

      {/* CONTENIDO PRINCIPAL: CONDICIONADO DE FORMA ESTRICTA POR ROL */}
      <main className="flex-1 w-full relative z-10">
        {!userRole ? (
          // USUARIO NO AUTENTICADO (COMENSAL): VE EXCLUSIVAMENTE LA CARTA
          <CustomerMenuView
            config={config}
            currentPlan={currentPlan}
            onLogoStealthClick={stealthTrigger.registerClick}
          />
        ) : userRole === 'waiter' ? (
          // ROL MESERO: PWA DE SALÓN O VISTA DE CONSULTA DE CARTA
          waiterViewMode === 'waiter' ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <WaiterModuleView currentPlan={currentPlan} />
            </div>
          ) : (
            <CustomerMenuView
              config={config}
              currentPlan={currentPlan}
              onLogoStealthClick={() => {}}
            />
          )
        ) : (
          // ROL ADMINISTRADOR O DESARROLLADOR: PANELES DE GESTIÓN O VISTA DE CARTA
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {adminTab === 'menu' && (
              <AdminMenuPanel
                config={config}
                currentPlan={currentPlan}
                onConfigUpdated={(newCfg) => setConfig(newCfg)}
              />
            )}
            {adminTab === 'cashier' && capabilities.allowKitchenComandas && (
              <CashierDashboard config={config} currentPlan={currentPlan} />
            )}
            {adminTab === 'analytics' && capabilities.allowFinancialStats && (
              <AnalyticsDashboard currentPlan={currentPlan} />
            )}
            {adminTab === 'customer' && (
              <CustomerMenuView
                config={config}
                currentPlan={currentPlan}
                onLogoStealthClick={() => {}}
              />
            )}
          </div>
        )}
      </main>

      {/* Modal de Acceso de Personal con Google OAuth (Activado por gatillo silencioso) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUserRole={userRole}
        currentUserEmail={staffUser?.email}
        onRoleChanged={handleRoleChanged}
      />

      {/* Modal Exclusivo de Desarrollador ARSIGEN */}
      {userRole === 'developer' && (
        <DeveloperModal
          isOpen={isDevModalOpen}
          currentPlan={currentPlan}
          onClose={() => setIsDevModalOpen(false)}
          onPlanChanged={handlePlanChanged}
        />
      )}
    </div>
  );
};

export default App;
