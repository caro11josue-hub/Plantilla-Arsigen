import React from 'react';
import { MenuCategory } from '../../domain/models';
import { CategoryIcon } from './CategoryIcon';

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
  return (
    <div className="sticky top-[69px] z-20 py-2.5 -mx-4 px-4 sm:-mx-6 sm:px-6 bg-[#0b0f19]/80 backdrop-blur-xl border-y border-white/5 mb-6">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 max-w-6xl mx-auto">
        {/* Opción Todos */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
            selectedCategoryId === null
              ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-102'
              : 'bg-slate-900/60 text-slate-300 border-white/10 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <CategoryIcon iconName="all" className="w-4 h-4" />
          <span>Todos</span>
        </button>

        {/* Categorías dinámicas ordenadas */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-102'
                  : 'bg-slate-900/60 text-slate-300 border-white/10 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CategoryIcon iconName={cat.iconSvgName} className="w-4 h-4 shrink-0" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
