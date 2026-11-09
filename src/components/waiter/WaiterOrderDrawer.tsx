import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, MenuCategory, OrderItemSnapshot, RestaurantTable } from '../../domain/models';
import { CategoryIcon } from '../menu/CategoryIcon';
import { formatCurrency } from '../../services/menuService';
import { GlassCard } from '../common/GlassCard';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  Send,
  MessageSquare,
} from 'lucide-react';

interface WaiterOrderDrawerProps {
  isOpen: boolean;
  table: RestaurantTable | null;
  isWaiterPersonalOrder?: boolean;
  waiterName: string;
  categories: MenuCategory[];
  menuItems: MenuItem[];
  onClose: () => void;
  onSubmitOrder: (items: OrderItemSnapshot[], notes: string) => Promise<void>;
}

export const WaiterOrderDrawer: React.FC<WaiterOrderDrawerProps> = ({
  isOpen,
  table,
  isWaiterPersonalOrder = false,
  waiterName,
  categories,
  menuItems,
  onClose,
  onSubmitOrder,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<OrderItemSnapshot[]>([]);
  const [globalNotes, setGlobalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar platos disponibles
  const availableItems = useMemo(() => {
    return menuItems.filter((i) => i.isAvailable);
  }, [menuItems]);

  const displayedCatalog = useMemo(() => {
    let result = availableItems;
    if (selectedCategoryId) {
      result = result.filter((i) => i.categoryId === selectedCategoryId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [availableItems, selectedCategoryId, searchQuery]);

  // Manejo del carrito de la comanda
  const handleAddItem = (dish: MenuItem) => {
    const isRound = table?.status === 'ocupada';
    setCart((prev) => {
      const existing = prev.find((it) => it.productId === dish.id);
      if (existing) {
        return prev.map((it) =>
          it.productId === dish.id
            ? { ...it, quantity: it.quantity + 1, subtotal: (it.quantity + 1) * it.unitPrice }
            : it
        );
      }
      return [
        ...prev,
        {
          productId: dish.id,
          productName: dish.name,
          unitPrice: dish.price,
          quantity: 1,
          subtotal: dish.price,
          addedAt: new Date().toISOString(),
          isAddedRound: isRound,
        },
      ];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((it) => {
          if (it.productId === productId) {
            const newQty = it.quantity + delta;
            return {
              ...it,
              quantity: newQty,
              subtotal: newQty * it.unitPrice,
            };
          }
          return it;
        })
        .filter((it) => it.quantity > 0);
    });
  };

  const handleUpdateItemNotes = (productId: string, notes: string) => {
    setCart((prev) =>
      prev.map((it) => (it.productId === productId ? { ...it, notes } : it))
    );
  };

  const totalAmount = cart.reduce((acc, it) => acc + it.subtotal, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      await onSubmitOrder(cart, globalNotes);
      setCart([]);
      setGlobalNotes('');
      setSearchQuery('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const title = isWaiterPersonalOrder
    ? `Pedido de Mesero: ${waiterName}`
    : `Comanda Mesa #${table?.number || ''} ${table?.status === 'ocupada' ? '(Adición)' : ''}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-xl h-full bg-[#0b0f19] border-l border-white/10 flex flex-col justify-between shadow-2xl relative"
        >
          {/* ============================================================== */}
          {/* ESPACIO 1 (SUPERIOR): Búsqueda con Autocompletado & Cabecera */}
          {/* ============================================================== */}
          <div className="p-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-md shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Espacio 1: Identificación & Búsqueda
                </span>
                <h3 className="text-base font-black text-white">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de Búsqueda con Autocompletado Instantáneo */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar plato para añadir rápidamente..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-amber-400/80"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* ESPACIO 2 (CENTRAL): Ítems Seleccionados con Cantidad y Notas  */}
          {/* ============================================================== */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Espacio 2: Platos en Comanda ({cart.length})
                </span>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Vaciar
                  </button>
                )}
              </div>

              {cart.length > 0 ? (
                <div className="space-y-2.5">
                  {cart.map((item) => (
                    <GlassCard key={item.productId} className="p-3 border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <h4 className="text-xs font-bold text-white truncate">{item.productName}</h4>
                          <div className="text-[11px] font-mono text-cyan-400">
                            {formatCurrency(item.unitPrice)} c/u
                          </div>
                        </div>

                        {/* Modificador de Cantidad (+ / -) */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, -1)}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 active:scale-95"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-black font-mono text-white w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, 1)}
                            className="w-7 h-7 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 flex items-center justify-center active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Nota específica de cocina */}
                      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={(e) => handleUpdateItemNotes(item.productId, e.target.value)}
                          placeholder="Nota cocina (ej: sin cebolla, término medio)..."
                          className="w-full bg-transparent text-[11px] text-slate-300 placeholder-slate-500 focus:outline-none"
                        />
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 px-4 rounded-xl border border-dashed border-white/10 text-slate-500 text-xs">
                  Aún no has añadido platos a la comanda. Toca un plato del catálogo a continuación para agregarlo.
                </div>
              )}
            </div>

            {/* Catálogo Rápido para Añadir Platos en 1 Toque */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Catálogo Disponible (Toca para agregar)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {displayedCatalog.map((dish) => (
                  <button
                    key={dish.id}
                    onClick={() => handleAddItem(dish)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left flex items-center justify-between gap-2 transition-all active:scale-98"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{dish.name}</div>
                      <div className="text-[10px] font-mono text-cyan-400">{formatCurrency(dish.price)}</div>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Nota General de la Mesa */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Nota General para Cocina / Barra
              </label>
              <input
                type="text"
                value={globalNotes}
                onChange={(e) => setGlobalNotes(e.target.value)}
                placeholder="Ej: Enviar entradas primero, cuenta separada..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* ============================================================== */}
          {/* ESPACIO 3 (INFERIOR): Selector Horizontal de Categorías SVG    */}
          {/* ============================================================== */}
          <div className="p-3 bg-slate-950 border-t border-white/10 shrink-0 space-y-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedCategoryId === null
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <CategoryIcon iconName="all" className="w-3.5 h-3.5" />
                <span>Todas</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                    selectedCategoryId === cat.id
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <CategoryIcon iconName={cat.iconSvgName} className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Total & Botones de Acción */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Comanda</span>
                <div className="text-lg font-black text-cyan-400 font-mono">
                  {formatCurrency(totalAmount)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={cart.length === 0 || isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Enviando...' : 'Enviar Comanda'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
