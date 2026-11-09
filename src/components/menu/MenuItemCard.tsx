import React from 'react';
import { MenuItem } from '../../domain/models';
import { formatCurrency } from '../../services/menuService';
import { GlassCard } from '../common/GlassCard';
import { Ban } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onClick }) => {
  return (
    <GlassCard
      onClick={() => onClick(item)}
      className={`group cursor-pointer p-3 sm:p-4 transition-all duration-300 hover:border-blue-500/40 hover:-translate-y-1 ${
        !item.isAvailable ? 'opacity-65 grayscale-[30%]' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4 h-full">
        {/* Imagen del plato con ratio fijo */}
        <div className="relative w-full sm:w-36 md:w-40 h-44 sm:h-36 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-white/5">
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />

          {/* Overlay de Agotado */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1 text-rose-400">
              <Ban className="w-6 h-6 stroke-[2.5]" />
              <span className="text-xs font-black uppercase tracking-wider">Agotado</span>
            </div>
          )}
        </div>

        {/* Información del plato */}
        <div className="flex flex-col justify-between flex-1 py-1">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                {item.name}
              </h3>
            </div>
            <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
            <div className="text-base font-black text-cyan-400 font-mono tracking-tight">
              {formatCurrency(item.price)}
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              IVA incl.
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
