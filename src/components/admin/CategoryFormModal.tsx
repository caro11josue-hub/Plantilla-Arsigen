import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuCategory } from '../../domain/models';
import { CategoryIcon } from '../menu/CategoryIcon';
import { GlassCard } from '../common/GlassCard';
import { X, Sparkles, Trash2 } from 'lucide-react';

interface CategoryFormModalProps {
  isOpen: boolean;
  category: MenuCategory | null;
  onClose: () => void;
  onSave: (category: MenuCategory) => Promise<void>;
  onDelete?: (categoryId: string) => Promise<void>;
}

const AVAILABLE_SVG_ICONS = [
  { id: 'burger', label: 'Hamburguesas' },
  { id: 'meat', label: 'Carnes & Parrilla' },
  { id: 'pizza', label: 'Pizzas' },
  { id: 'salad', label: 'Ensaladas & Entradas' },
  { id: 'drinks', label: 'Bebidas' },
  { id: 'beer', label: 'Cervezas' },
  { id: 'coffee', label: 'Cafetería' },
  { id: 'dessert', label: 'Postres' },
  { id: 'soup', label: 'Sopas & Cremas' },
  { id: 'fish', label: 'Pescados & Mariscos' },
  { id: 'flame', label: 'Especialidades al Fuego' },
];

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  category,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [iconSvgName, setIconSvgName] = useState('burger');
  const [sortOrder, setSortOrder] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIconSvgName(category.iconSvgName);
      setSortOrder(category.sortOrder);
    } else {
      setName('');
      setIconSvgName('burger');
      setSortOrder(99);
    }
  }, [category, isOpen]);

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
    if (confirm(`¿Seguro que deseas eliminar la categoría "${category.name}"?`)) {
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md"
        >
          <GlassCard glow className="border-blue-500/30 p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                {category ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Coctelería de Autor"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Selector de Icono SVG */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Icono Vectorial SVG (Sin Emojis) *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_SVG_ICONS.map((icon) => {
                    const isSelected = iconSvgName === icon.id;
                    return (
                      <button
                        type="button"
                        key={icon.id}
                        onClick={() => setIconSvgName(icon.id)}
                        className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30 scale-105'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                        title={icon.label}
                      >
                        <CategoryIcon iconName={icon.id} className="w-5 h-5" />
                        <span className="text-[10px] truncate max-w-[65px]">{icon.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                {category && onDelete ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar Categoría'}
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
