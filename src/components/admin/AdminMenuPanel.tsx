import React, { useState, useEffect } from 'react';
import { PlanTier, RestaurantConfig, MenuItem, MenuCategory } from '../../domain/models';
import { getCapabilitiesForPlan } from '../../config/capabilities';
import {
  subscribeToCategories,
  subscribeToMenuItems,
  toggleProductAvailability,
  saveMenuItem,
  deleteMenuItem,
  saveCategory,
  deleteCategory,
  formatCurrency,
} from '../../services/menuService';
import { ProductFormModal } from './ProductFormModal';
import { CategoryFormModal } from './CategoryFormModal';
import { SocialSettingsModal } from './SocialSettingsModal';
import { CategoryIcon } from '../menu/CategoryIcon';
import { GlassCard } from '../common/GlassCard';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  Search,
  AlertTriangle,
  Lock,
  Sparkles,
  Share2,
} from 'lucide-react';

interface AdminMenuPanelProps {
  config: RestaurantConfig | null;
  currentPlan: PlanTier;
  onConfigUpdated: (newConfig: RestaurantConfig) => void;
}

export const AdminMenuPanel: React.FC<AdminMenuPanelProps> = ({
  config,
  currentPlan,
  onConfigUpdated,
}) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

  const capabilities = getCapabilitiesForPlan(currentPlan);

  useEffect(() => {
    const unsubCats = subscribeToCategories(setCategories);
    const unsubItems = subscribeToMenuItems(setItems);
    return () => {
      unsubCats();
      unsubItems();
    };
  }, []);

  const handleToggleStock = async (item: MenuItem) => {
    try {
      await toggleProductAvailability(item.id, !item.isAvailable);
    } catch (err) {
      console.error('Error al pausar stock:', err);
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (confirm(`¿Eliminar definitivamente "${item.name}" del menú?`)) {
      try {
        await deleteMenuItem(item.id);
      } catch (err) {
        console.error('Error al eliminar plato:', err);
      }
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCat = !selectedCategoryId || item.categoryId === selectedCategoryId;
    const matchesQuery =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const isLimitReached = items.length >= capabilities.maxProducts;

  // Si está en Plan Start, mostrar pantalla informativa de capacidades restringidas
  if (!capabilities.allowAdminMenuEdit) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <GlassCard glow className="border-amber-500/30 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Edición de Menú Restringida (Plan Start)
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            El <strong>Plan Start</strong> está concebido como una vitrina digital estática de alta velocidad.
            Las modificaciones de platos, fotos y cartas son gestionadas directamente por el equipo de
            soporte técnico de ARSIGEN (hasta 3 cambios incluidos al mes).
          </p>
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-400 max-w-md mx-auto text-left space-y-1.5">
            <div className="font-bold text-slate-200 uppercase tracking-wider mb-2">
              Para habilitar este panel en tiempo real:
            </div>
            <div>• <strong>Plan Pro:</strong> Autogestión de 50 platos, stock en 1 toque y redes.</div>
            <div>• <strong>Plan Business:</strong> Platos ilimitados, módulos de salón, comandas y POS.</div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Panel de Administración de Menú
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Control de categorías, platos, precios netos y disponibilidad en tiempo real respaldados en Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {capabilities.allowSocialLinks && (
            <button
              onClick={() => setIsSocialModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Redes & Maps</span>
            </button>
          )}

          <button
            onClick={() => {
              setEditingCategory(null);
              setIsCategoryModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-300 flex items-center gap-2 transition-colors"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Nueva Categoría</span>
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setIsProductModalOpen(true);
            }}
            disabled={isLimitReached}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-500/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Plato</span>
          </button>
        </div>
      </div>

      {/* Indicador de límite de platos del plan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="font-semibold text-white uppercase tracking-wider">Capacidad del Plan {currentPlan}:</span>
          <span className="font-mono text-amber-400 font-bold">
            {items.length} / {capabilities.maxProducts === 9999 ? 'Ilimitados' : `${capabilities.maxProducts} platos`}
          </span>
        </div>

        {isLimitReached && (
          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <AlertTriangle className="w-4 h-4" />
            <span>Límite de platos alcanzado para el plan {currentPlan}.</span>
          </div>
        )}
      </div>

      {/* Filtros: Búsqueda y Categorías con Edición Directa */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por nombre o ingredientes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategoryId === null
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Todas
          </button>

          {categories.map((c) => {
            const isSelected = selectedCategoryId === c.id;
            return (
              <div key={c.id} className="flex items-center shrink-0">
                <button
                  onClick={() => setSelectedCategoryId(c.id)}
                  className={`px-3 py-1.5 rounded-l-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <CategoryIcon iconName={c.iconSvgName} className="w-3.5 h-3.5" />
                  <span>{c.name}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCategory(c);
                    setIsCategoryModalOpen(true);
                  }}
                  title={`Editar o eliminar categoría "${c.name}"`}
                  className={`px-2 py-1.5 rounded-r-xl border-l border-white/10 text-xs transition-colors ${
                    isSelected
                      ? 'bg-amber-700 text-amber-200 hover:bg-amber-800'
                      : 'bg-white/5 text-slate-400 hover:text-amber-400 hover:bg-white/10'
                  }`}
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setEditingCategory(null);
              setIsCategoryModalOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors shrink-0"
            title="Crear nueva categoría"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Categoría</span>
          </button>
        </div>
      </div>

      {/* Lista de Platos en formato Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const cat = categories.find((c) => c.id === item.categoryId);
          return (
            <GlassCard key={item.id} className="p-4 flex gap-4 items-center justify-between border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-white/5">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-[10px] font-black uppercase text-rose-400">
                      Agotado
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {cat?.name || 'General'}
                  </div>
                  <div className="text-xs font-black text-amber-400 font-mono mt-1">
                    {formatCurrency(item.price)}
                  </div>
                </div>
              </div>

              {/* Controles de Acción */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Switch de Disponibilidad en 1 toque */}
                <button
                  onClick={() => handleToggleStock(item)}
                  title={item.isAvailable ? 'Disponible (clic para pausar)' : 'Agotado (clic para activar)'}
                  className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                    item.isAvailable ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      item.isAvailable ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>

                {/* Editar */}
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setIsProductModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Editar plato"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Eliminar */}
                <button
                  onClick={() => handleDeleteItem(item)}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                  title="Eliminar plato"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Modales */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        item={editingItem}
        categories={categories}
        onClose={() => setIsProductModalOpen(false)}
        onSave={async (itemToSave) => {
          await saveMenuItem(itemToSave);
        }}
      />

      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        category={editingCategory}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={async (catToSave) => {
          await saveCategory(catToSave);
        }}
        onDelete={async (catId) => {
          await deleteCategory(catId);
          if (selectedCategoryId === catId) {
            setSelectedCategoryId(null);
          }
        }}
      />

      <SocialSettingsModal
        isOpen={isSocialModalOpen}
        config={config}
        onClose={() => setIsSocialModalOpen(false)}
        onConfigSaved={onConfigUpdated}
      />
    </div>
  );
};
