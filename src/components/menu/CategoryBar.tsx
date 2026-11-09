import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { MenuCategory } from '../../domain/models';
import { CategoryIcon } from './CategoryIcon';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryBarProps {
  categories: MenuCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-0 z-20 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 bg-[#0b0f19]/90 backdrop-blur-2xl border-y border-white/5 mb-8">
      <div className="relative max-w-6xl mx-auto flex items-center">
        {/* Botón Scroll Izquierda (oculto en móviles) */}
        <button
          onClick={() => handleScroll('left')}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-black/50 border border-white/10 text-slate-300 hover:text-white hover:border-amber-500/40 transition-all shrink-0 mr-2 z-10"
          title="Desplazar a la izquierda"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Contenedor horizontal con scroll inercial */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Opción Todos */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectCategory(null)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 border select-none ${
              selectedCategoryId === null
                ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 text-white border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            <CategoryIcon iconName="all" className="w-4 h-4" />
            <span>Toda la Carta</span>
          </motion.button>

          {/* Categorías dinámicas */}
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shrink-0 border select-none ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 text-white border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                    : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <CategoryIcon iconName={cat.iconSvgName} className="w-4 h-4 shrink-0" />
                <span>{cat.name}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Botón Scroll Derecha (oculto en móviles) */}
        <button
          onClick={() => handleScroll('right')}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-black/50 border border-white/10 text-slate-300 hover:text-white hover:border-amber-500/40 transition-all shrink-0 ml-2 z-10"
          title="Desplazar a la derecha"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
