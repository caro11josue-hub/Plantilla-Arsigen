import React, { useState, useEffect, useMemo } from 'react';
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
import { UtensilsCrossed, AlertCircle } from 'lucide-react';

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
    <div className="w-full pb-16">
      {/* Cabecera del Restaurante con gatillo de sigilo */}
      <MenuHeader
        config={config}
        currentPlan={currentPlan}
        onLogoClick={onLogoStealthClick}
        awaitingSpace={awaitingSpace}
      />

      {/* Barra de Búsqueda */}
      <div className="px-4 sm:px-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          resultCount={filteredItems.length}
        />
      </div>

      {/* Barra Horizontal de Categorías (SVG) */}
      <CategoryBar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* Rejilla de Platos */}
      <div className="px-4 sm:px-6 max-w-6xl mx-auto">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onClick={(clicked) => setSelectedItemForDetail(clicked)}
              />
            ))}
          </div>
        ) : (
          <GlassCard className="text-center py-12 px-4 max-w-md mx-auto">
            <UtensilsCrossed className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No se encontraron platos</h3>
            <p className="text-xs text-slate-400 mt-1">
              Intenta con otra palabra clave o selecciona otra categoría en la barra superior.
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold hover:bg-blue-600/40 transition-colors"
              >
                Limpiar búsqueda
              </button>
            )}
          </GlassCard>
        )}
      </div>

      {/* Modal de Detalle de Plato */}
      <MenuItemDetailModal
        item={selectedItemForDetail}
        category={activeCategory}
        onClose={() => setSelectedItemForDetail(null)}
      />
    </div>
  );
};
