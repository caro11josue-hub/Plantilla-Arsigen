import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlanTier, RestaurantConfig, MenuItem, MenuCategory } from '../../domain/models';
import { getCapabilitiesForPlan } from '../../config/capabilities';
import {
  subscribeToCategories,
  subscribeToMenuItems,
} from '../../services/menuService';
import { MenuHeader } from './MenuHeader';
import { SearchBar } from './SearchBar';
import { CategoryBar } from './CategoryBar';
import { MenuItemCard } from './MenuItemCard';
import { MenuItemDetailModal } from './MenuItemDetailModal';
import { GlassCard } from '../common/GlassCard';
import { UtensilsCrossed, Sparkles, ExternalLink, Flame } from 'lucide-react';

interface CustomerMenuViewProps {
  config: RestaurantConfig | null;
  currentPlan: PlanTier;
  onLogoStealthClick: () => void;
  awaitingSpace?: boolean;
}

export const CustomerMenuView: React.FC<CustomerMenuViewProps> = ({
  config,
  currentPlan,
  onLogoStealthClick,
  awaitingSpace,
}) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<MenuItem | null>(null);

  const capabilities = getCapabilitiesForPlan(currentPlan);

  // Escuchar categorías y platos en tiempo real
  useEffect(() => {
    const unsubCategories = subscribeToCategories(setCategories);
    const unsubItems = subscribeToMenuItems(setItems);

    return () => {
      unsubCategories();
      unsubItems();
    };
  }, []);

  // Filtrado reactivo por categoría, búsqueda y límite del plan
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Aplicar límite de productos según plan (Plan Start: máx 35)
    if (capabilities.maxProducts < result.length) {
      result = result.slice(0, capabilities.maxProducts);
    }

    // Filtrar por categoría
    if (selectedCategoryId) {
      result = result.filter((item) => item.categoryId === selectedCategoryId);
    }

    // Filtrar por búsqueda en tiempo real
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [items, selectedCategoryId, searchQuery, capabilities.maxProducts]);

  const activeCategory = categories.find((c) => c.id === selectedItemForDetail?.categoryId);

  return (
    <div className="w-full pb-20">
      {/* Cabecera del Restaurante con temática de brasas y gatillo de sigilo */}
      <MenuHeader
        config={config}
        currentPlan={currentPlan}
        onLogoClick={onLogoStealthClick}
        awaitingSpace={awaitingSpace}
      />

      {/* Barra de Búsqueda */}
      <div className="px-4 sm:px-6 mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          resultCount={filteredItems.length}
        />
      </div>

      {/* Barra Horizontal de Categorías con Scroll Cinemático */}
      <CategoryBar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* Rejilla Orgánica de Platos */}
      <div className="px-4 sm:px-6 max-w-6xl mx-auto">
        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-6"
            >
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onClick={(clicked) => setSelectedItemForDetail(clicked)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <GlassCard className="text-center py-16 px-4 max-w-md mx-auto border-amber-500/20">
                <UtensilsCrossed className="w-12 h-12 text-amber-500/50 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No se encontraron platos</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Intenta con otra palabra clave o selecciona otra categoría en la barra superior.
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-4 py-2 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-600/30 transition-colors"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Detalle de Plato */}
      <MenuItemDetailModal
        item={selectedItemForDetail}
        category={activeCategory}
        onClose={() => setSelectedItemForDetail(null)}
      />

      {/* Pie de Página Discreto y Elegante de ARSIGEN */}
      <footer className="mt-20 pt-10 border-t border-white/10 px-4 text-center max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-2">
          {/* Monograma minimalista de ARSIGEN */}
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-sm">
              <span className="text-[10px] text-white font-black">A</span>
            </div>
            <span>Tecnología operativa desarrollada por ARSIGEN</span>
          </div>

          <p className="text-xs text-slate-400 max-w-md leading-relaxed mt-1">
            ¿Deseas una carta digital interactiva, toma de comandas en salón y sistema POS para tu negocio gastronómico?
          </p>

          <a
            href="https://arsigen.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all hover:scale-102"
          >
            <span>Conoce más en arsigen.com</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </a>

          <div className="text-[11px] text-slate-400 mt-4 font-mono">
            © {new Date().getFullYear()} ARSIGEN SAS · Todos los derechos reservados
          </div>
        </div>
      </footer>
    </div>
  );
};
