import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthorizedStaff } from '../../domain/models';
import {
  listWaiters,
  saveAuthorizedStaffUser,
  toggleAuthorizedStaffActive,
  deleteAuthorizedStaffUser,
} from '../../services/developerService';
import { GlassCard } from '../common/GlassCard';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  User,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

export const AdminWaitersPanel: React.FC = () => {
  const [waiters, setWaiters] = useState<AuthorizedStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Formulario de Nuevo Mesero
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Modal de Edición de Mesero
  const [editingWaiter, setEditingWaiter] = useState<AuthorizedStaff | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    loadWaitersList();
  }, []);

  const loadWaitersList = async () => {
    setLoading(true);
    try {
      const list = await listWaiters();
      setWaiters(list);
    } catch (err) {
      console.error('[AdminWaitersPanel] Error al listar meseros:', err);
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Registrar nuevo mesero (exclusivamente role === 'waiter')
  const handleCreateWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newName.trim();
    const cleanEmail = newEmail.trim().toLowerCase();

    if (!cleanName) {
      showFeedback('error', 'Por favor ingresa el nombre del mesero.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      showFeedback('error', 'Por favor ingresa un correo de Google válido (Gmail).');
      return;
    }

    // Verificar si ya existe en la lista
    const alreadyExists = waiters.some(
      (w) => w.email.toLowerCase().trim() === cleanEmail
    );
    if (alreadyExists) {
      showFeedback('error', `El correo ${cleanEmail} ya está registrado como mesero.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await saveAuthorizedStaffUser(cleanEmail, 'waiter', cleanName, true);
      setNewName('');
      setNewEmail('');
      showFeedback('success', `¡Mesero "${cleanName}" autorizado exitosamente!`);
      await loadWaitersList();
    } catch (err: any) {
      showFeedback('error', err?.message || 'Error al autorizar mesero');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir modal de edición
  const handleOpenEdit = (waiter: AuthorizedStaff) => {
    setEditingWaiter(waiter);
    setEditName(waiter.name);
    setEditEmail(waiter.email);
  };

  // Guardar edición: si se cambia el correo, se erradica el antiguo para evitar duplicados
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWaiter) return;

    const cleanName = editName.trim();
    const cleanEmail = editEmail.trim().toLowerCase();
    const oldEmail = editingWaiter.email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !cleanEmail.includes('@')) {
      showFeedback('error', 'Ingresa un nombre y correo válidos.');
      return;
    }

    // Si cambió el correo y el nuevo ya pertenece a otro mesero
    if (cleanEmail !== oldEmail && waiters.some((w) => w.email.toLowerCase().trim() === cleanEmail)) {
      showFeedback('error', `El correo ${cleanEmail} ya está asignado a otro mesero.`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Pasa oldEmail como previousEmail: elimina el anterior y guarda el nuevo limpiamente
      await saveAuthorizedStaffUser(cleanEmail, 'waiter', cleanName, editingWaiter.active, oldEmail);
      setEditingWaiter(null);
      showFeedback('success', cleanEmail !== oldEmail 
        ? `Correo actualizado a ${cleanEmail} y anterior eliminado.`
        : `Datos de "${cleanName}" actualizados.`
      );
      await loadWaitersList();
    } catch (err: any) {
      showFeedback('error', err?.message || 'Error al actualizar mesero');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Activo/Inactivo
  const handleToggleActive = async (waiter: AuthorizedStaff) => {
    try {
      await toggleAuthorizedStaffActive(waiter.email, !waiter.active);
      await loadWaitersList();
      showFeedback(
        'success',
        `Mesero "${waiter.name}" ${!waiter.active ? 'activado' : 'desactivado'}.`
      );
    } catch (err) {
      console.error('[AdminWaitersPanel] Error al cambiar estado:', err);
      showFeedback('error', 'No fue posible cambiar el estado del mesero.');
    }
  };

  // Eliminar mesero
  const handleDeleteWaiter = async (waiter: AuthorizedStaff) => {
    const confirmed = confirm(
      `¿Revocar acceso y eliminar definitivamente al mesero "${waiter.name}" (${waiter.email})?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    try {
      await deleteAuthorizedStaffUser(waiter.email);
      showFeedback('success', `Mesero "${waiter.name}" eliminado del personal.`);
      await loadWaitersList();
    } catch (err) {
      console.error('[AdminWaitersPanel] Error al eliminar mesero:', err);
      showFeedback('error', 'No fue posible eliminar al mesero.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-md shadow-amber-500/10">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Gestión de Meseros (Salón)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 pl-11">
            Crea y administra las cuentas de Google de tus meseros. Tienen acceso exclusivo al mapa de mesas y toma de comandas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-xs font-bold">
            {waiters.length} {waiters.length === 1 ? 'Mesero registrado' : 'Meseros registrados'}
          </span>
        </div>
      </div>

      {/* Alerta de Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500/30 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulario para Crear Nuevo Mesero (Exclusivamente Rol 'waiter') */}
      <GlassCard glow className="border-amber-500/30 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <UserPlus className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
            Autorizar Nuevo Mesero
          </h2>
        </div>

        <form onSubmit={handleCreateWaiter} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
          <div className="sm:col-span-5 space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 block">
              Nombre del Mesero *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Carlos Mendoza"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
              />
            </div>
          </div>

          <div className="sm:col-span-5 space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 block">
              Correo Google (Gmail) *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="mesero@gmail.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[42px] px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Crear Mesero</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
          <span>
            El mesero iniciará sesión automáticamente con su cuenta de Google mediante el acceso de personal. No requiere contraseñas complejas ni PINs compartidos.
          </span>
        </div>
      </GlassCard>

      {/* Listado de Meseros */}
      <GlassCard className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
            Personal de Salón Autorizado
          </h2>
          <span className="text-[11px] text-slate-400">
            Total activos: {waiters.filter((w) => w.active).length}
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span>Cargando meseros autorizados...</span>
          </div>
        ) : waiters.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] text-slate-500 border border-white/5 mx-auto flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">
              No hay meseros registrados todavía
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Utiliza el formulario superior para autorizar a tu primer mesero con su correo Gmail y darle acceso al salón.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {waiters.map((waiter) => (
              <div
                key={waiter.email}
                className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 shadow-inner">
                    {waiter.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                        {waiter.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Mesero
                      </span>
                      {!waiter.active && (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5 truncate">
                      <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{waiter.email}</span>
                      {waiter.lastLoginAt && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="text-[11px] text-slate-500">
                            Último acceso: {new Date(waiter.lastLoginAt).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones del Mesero */}
                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  {/* Switch Activar/Desactivar */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(waiter)}
                    title={waiter.active ? 'Desactivar mesero' : 'Activar mesero'}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      waiter.active ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        waiter.active ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  {/* Editar Mesero */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(waiter)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                    title="Editar nombre o corregir correo"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Eliminar Mesero */}
                  <button
                    type="button"
                    onClick={() => handleDeleteWaiter(waiter)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
                    title="Revocar acceso y eliminar mesero"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Modal de Edición de Mesero */}
      <AnimatePresence>
        {editingWaiter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <GlassCard glow className="border-amber-500/40 p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-amber-400" />
                    <h3 className="text-base font-bold text-white">
                      Editar Mesero
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingWaiter(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Nombre del Mesero *
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Correo Google (Gmail) *
                    </label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-500/60"
                    />
                    {editEmail.toLowerCase().trim() !== editingWaiter.email.toLowerCase().trim() && (
                      <p className="text-[11px] text-amber-400 font-medium mt-1">
                        Aviso: Al corregir el correo, el correo anterior ({editingWaiter.email}) será eliminado de inmediato para evitar cuentas duplicadas.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditingWaiter(null)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold text-xs shadow-lg shadow-amber-600/30 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
