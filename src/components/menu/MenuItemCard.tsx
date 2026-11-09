import React from 'react';
import { motion } from 'motion/react';
import { MenuItem } from '../../domain/models';
import { formatCurrency } from '../../services/menuService';
import { Ban, Flame } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => onClick(item)}
      className={`group cursor-pointer relative rounded-3xl p-4 sm:p-5 transition-all duration-300 select-none ${
        !item.isAvailable ? 'opacity-60 grayscale-[35%]' : ''
      }`}
      style={{
        background:
          'radial-gradient(120% 120% at 0% 0%, rgba(245, 158, 11, 0.05) 0%, rgba(15, 23, 42, 0.6) 50%, rgba(11, 15, 25, 0.8) 100%)',
        boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Resplandor cálido de brasas al pasar el cursor */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-600/0 via-amber-500/0 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 h-full relative z-10">
        {/* Fotografía gastronómica orgánica */}
        <div className="relative w-full sm:w-40 md:w-44 h-48 sm:h-36 rounded-2xl overflow-hidden shrink-0 bg-slate-950 border border-white/10 shadow-lg">
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          />

          {/* Gradiente sutil en base de imagen */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Badge de brasa / sello artesanal */}
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center gap-1 text-[10px] font-bold text-amber-300">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>A la Brasa</span>
          </div>

          {/* Overlay de Agotado */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-[3px] flex flex-col items-center justify-center gap-1 text-rose-400">
              <Ban className="w-6 h-6 stroke-[2.5]" />
              <span className="text-xs font-black uppercase tracking-wider">Agotado</span>
            </div>
          )}
        </div>

        {/* Información Editorial Culinaria */}
        <div className="flex flex-col justify-between flex-1 py-0.5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 tracking-tight">
              {item.name}
            </h3>
            <p className="mt-1.5 text-xs text-slate-300/80 line-clamp-2 leading-relaxed font-normal">
              {item.description}
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-white/5 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-amber-400 font-mono tracking-tight">
                {formatCurrency(item.price)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                COP
              </span>
            </div>

            <div className="text-[10px] font-semibold text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              IVA Incluido
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
