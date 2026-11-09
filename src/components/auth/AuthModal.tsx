import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../common/GlassCard';
import { loginWithGoogle, logout } from '../../services/authService';
import { UserRole } from '../../domain/models';
import { Lock, LogOut, UserCheck, ShieldAlert, X, AlertTriangle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: UserRole | null;
  currentUserEmail?: string | null;
  onRoleChanged: (role: UserRole | null, email?: string | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUserRole,
  currentUserEmail,
  onRoleChanged,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { staff } = await loginWithGoogle();
      onRoleChanged(staff.role, staff.email);
      onClose();
    } catch (err: any) {
      console.error('Error al autenticar:', err);
      setErrorMessage(
        err?.message || 'Error en autenticación con Google. Verifica que tu correo esté autorizado.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      onRoleChanged(null, null);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md"
          >
            <GlassCard glow className="border-amber-500/30">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Acceso de Personal</h3>
                    <p className="text-xs text-slate-400">Portal cerrado para colaboradores autorizados</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {currentUserRole ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <UserCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <div className="text-sm font-bold text-white uppercase tracking-wider">
                      Sesión Activa: {currentUserRole}
                    </div>
                    {currentUserEmail && (
                      <div className="text-xs text-emerald-300 font-mono mt-1">
                        {currentUserEmail}
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-2">
                      Autenticado bajo verificación de lista blanca del establecimiento.
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Este software es de acceso cerrado. Únicamente las cuentas de Google previamente registradas por la administración pueden acceder a los módulos de salón, cocina y caja.
                  </p>

                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-white text-slate-900 font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-lg active:scale-98 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    {loading ? 'Verificando autorización...' : 'Continuar con Google'}
                  </button>

                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs leading-relaxed"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
