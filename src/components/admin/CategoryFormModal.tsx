import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuCategory } from '../../domain/models';
import { CategoryIcon } from '../menu/CategoryIcon';
import { GlassCard } from '../common/GlassCard';
import {
  VECTOR_ICONS_CATALOG,
  ICON_GROUPS,
  IconGroup,
} from '../../config/icons.catalog';
import { X, Sparkles, Trash2, Search, Check } from 'lucide-react';

interface CategoryFormModalProps {
  isOpen: boolean;
  category: MenuCategory | null;
  onClose: () => void;
  onSave: (category: MenuCategory) => Promise<void>;
  onDelete?: (categoryId: string) => Promise<void>;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  category,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [iconSvgName, setIconSvgName] = useState('beef');
  const [sortOrder, setSortOrder] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<IconGroup | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIconSvgName(category.iconSvgName || 'beef');
      setSortOrder(category.sortOrder || 1);
    } else {
      setName('');
      setIconSvgName('flame');
      setSortOrder(99);
    }
    setSelectedGroup('todos');
    setSearchQuery('');
  }, [category, isOpen]);

  // Filtrado reactivo de iconos vectoriales disponibles
  const filteredIcons = useMemo(() => {
    return VECTOR_ICONS_CATALOG.filter((item) => {
      const matchesGroup = selectedGroup === 'todos' || item.group === selectedGroup;
      const matchesSearch =
        !searchQuery.trim() ||
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGroup && matchesSearch;
    });
  }, [selectedGroup, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const savedCategory: MenuCategory = {
        id: category?.id || `cat_${Date.now()}`,
        name: name.trim(),
        iconSvgName,
        sortOrder: Number(sortOrder) || 1,
        isActive: true,
        createdAt: category?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await onSave(savedCategory);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!category || !onDelete) return;
    if (confirm(`¿Seguro que deseas eliminar la categoría "${category.name}"? Los productos asociados permanecerán en el sistema pero deberás reasignarlos.`)) {
      setIsSaving(true);
      try {
        await onDelete(category.id);
        onClose();
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (!isOpen) return null;

  const currentIconDef = VECTOR_ICONS_CATALOG.find((i) => i.id === iconSvgName);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl max-h-[92vh] flex flex-col"
        >
          <GlassCard glow className="border-amber-500/30 p-5 sm:p-6 flex flex-col max-h-[90vh]">
            {/* Cabecera */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <CategoryIcon iconName={iconSvgName} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {category ? 'Editar Categoría' : 'Nueva Categoría'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Define el nombre y asocia un icono vectorial independiente del catálogo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nombre de la Categoría *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Cortes Madurados, Coctelería..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Selector de Icono Vectorial Independiente */}
              <div className="flex flex-col flex-1 min-h-0 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Catálogo de Iconos Vectoriales ({VECTOR_ICONS_CATALOG.length})
                  </label>
                  {currentIconDef && (
                    <span className="text-[11px] text-amber-300 font-medium bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      Seleccionado: {currentIconDef.label}
                    </span>
                  )}
                </div>

                {/* Filtro y Búsqueda */}
                <div className="flex flex-col sm:flex-row gap-2 mb-2 shrink-0">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar icono por nombre o símbolo..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                    {ICON_GROUPS.map((g) => (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() => setSelectedGroup(g.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                          selectedGroup === g.id
                            ? 'bg-amber-600 text-white'
                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grilla de Iconos Vectoriales */}
                <div className="flex-1 overflow-y-auto pr-1 min-h-[160px] max-h-[220px] rounded-xl bg-black/40 border border-white/5 p-2 grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {filteredIcons.map((item) => {
                    const isSelected = iconSvgName === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setIconSvgName(item.id)}
                        className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all text-center relative ${
                          isSelected
                            ? 'bg-gradient-to-b from-amber-600 to-orange-600 text-white border-amber-400 shadow-md shadow-amber-500/30 scale-105 z-10'
                            : 'bg-white/[0.03] text-slate-300 border-white/10 hover:bg-white/[0.08] hover:text-white'
                        }`}
                        title={item.label}
                      >
                        <CategoryIcon iconName={item.id} className="w-5 h-5 shrink-0" />
                        <span className="text-[10px] leading-tight line-clamp-1 w-full px-0.5">
                          {item.label}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-white text-amber-700 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {filteredIcons.length === 0 && (
                    <div className="col-span-full py-8 text-center text-xs text-slate-400">
                      No se encontraron iconos que coincidan con &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 shrink-0">
                {category && onDelete ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="p-2.5 rounded-xl text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Eliminar Categoría</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSaving}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Guardando...' : category ? 'Guardar Cambios' : 'Crear Categoría'}
                  </button>
                </div>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
