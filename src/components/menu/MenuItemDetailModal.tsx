import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, MenuCategory } from '../../domain/models';
import { formatCurrency } from '../../services/menuService';
import { GlassCard } from '../common/GlassCard';
import { X, Ban, Sparkles } from 'lucide-react';

interface MenuItemDetailModalProps {
  item: MenuItem | null;
  category?: MenuCategory;
  onClose: () => void;
}

export const MenuItemDetailModal: React.FC<MenuItemDetailModalProps> = ({
  item,
  category,
  onClose,
}) => {
  if (!item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg"
        >
          <GlassCard glow className="p-0 overflow-hidden border-white/20">
            {/* Imagen Grande con botón de cerrar */}
            <div className="relative h-64 sm:h-72 w-full bg-slate-900">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover object-center"
              />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {category && (
                <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold text-slate-200 border border-white/10">
                  {category.name}
                </div>
              )}

              {!item.isAvailable && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1 text-rose-400">
                  <Ban className="w-10 h-10 stroke-[2.5]" />
                  <span className="text-sm font-black uppercase tracking-wider">Agotado Temporalmente</span>
                </div>
              )}
            </div>

            {/* Contenido */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {item.name}
                </h2>
                <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono shrink-0">
                  {formatCurrency(item.price)}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Descripción & Preparación
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Preparado al momento con ingredientes frescos</span>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
