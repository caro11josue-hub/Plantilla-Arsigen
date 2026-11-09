import React, { useState, useEffect } from 'react';
import { PlanTier, RestaurantTable, OrderItemSnapshot, MenuCategory, MenuItem } from '../../domain/models';
import { getCapabilitiesForPlan } from '../../config/capabilities';
import {
  subscribeToTables,
  createTableOrderAtomic,
  addItemsToTableOrder,
} from '../../services/tableService';
import {
  subscribeToCategories,
  subscribeToMenuItems,
} from '../../services/menuService';
import { TableGrid } from './TableGrid';
import { WaiterOrderDrawer } from './WaiterOrderDrawer';
import { GlassCard } from '../common/GlassCard';
import { Lock, CheckCircle2, UserCheck } from 'lucide-react';

interface WaiterModuleViewProps {
  currentPlan: PlanTier;
  waiterName?: string;
}

export const WaiterModuleView: React.FC<WaiterModuleViewProps> = ({
  currentPlan,
  waiterName = 'Mesero Salón',
}) => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [isPersonalOrder, setIsPersonalOrder] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const capabilities = getCapabilitiesForPlan(currentPlan);

  useEffect(() => {
    const unsubTables = subscribeToTables(setTables);
    const unsubCats = subscribeToCategories(setCategories);
    const unsubItems = subscribeToMenuItems(setMenuItems);

    return () => {
      unsubTables();
      unsubCats();
      unsubItems();
    };
  }, []);

  const handleSelectTable = (table: RestaurantTable) => {
    setSelectedTable(table);
    setIsPersonalOrder(false);
    setIsDrawerOpen(true);
  };

  const handleWaiterPersonalOrder = () => {
    setSelectedTable(null);
    setIsPersonalOrder(true);
    setIsDrawerOpen(true);
  };

  const handleSubmitOrder = async (items: OrderItemSnapshot[], notes: string) => {
    if (isPersonalOrder) {
      await createTableOrderAtomic({
        tableNumber: 0,
        isWaiterPersonalOrder: true,
        waiterId: 'waiter_personal',
        waiterName,
        items,
        notes: `Pedido a nombre de ${waiterName}. ${notes}`,
      });
      showToast(`¡Comanda enviada a cocina a nombre de ${waiterName}!`);
    } else if (selectedTable) {
      if (selectedTable.status === 'ocupada' && selectedTable.activeOrderId) {
        // Adición de platos
        await addItemsToTableOrder({
          tableNumber: selectedTable.number,
          orderId: selectedTable.activeOrderId,
          waiterId: 'waiter_active',
          waiterName,
          newItems: items,
          notes,
        });
        showToast(`¡Ronda de adición enviada a Mesa #${selectedTable.number}!`);
      } else {
        // Apertura atómica
        await createTableOrderAtomic({
          tableNumber: selectedTable.number,
          isWaiterPersonalOrder: false,
          waiterId: 'waiter_active',
          waiterName,
          items,
          notes,
        });
        showToast(`¡Mesa #${selectedTable.number} abierta y comanda enviada!`);
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Restricción por plan (Solo en Plan Business)
  if (!capabilities.allowWaiterModule) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <GlassCard glow className="border-amber-500/30 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Módulo de Meseros No Incluido en Plan {currentPlan.toUpperCase()}
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            La toma de pedidos por meseros con mapa de mesas y cajón de comanda en 3 espacios
            es una funcionalidad exclusiva del <strong>Plan Business</strong>.
          </p>
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-400 max-w-md mx-auto text-left space-y-2">
            <div className="font-bold text-slate-200 uppercase tracking-wider">
              El Plan Business Incluye:
            </div>
            <div>• Cuentas de meseros ilimitadas sin costo adicional.</div>
            <div>• Mapa interactivo para hasta 70 mesas.</div>
            <div>• Cajón de toma de comandas rápido en 3 espacios (WTR-03).</div>
            <div>• Impresión automática de comandas y pre-cuentas en 58mm.</div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Mesero */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{waiterName}</h2>
            <p className="text-xs text-slate-400">Turno de Salón Activo · Plan Business</p>
          </div>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300">
          Mesas en sala: {tables.length} / {capabilities.maxTables}
        </div>
      </div>

      {/* Grid de Mesas */}
      <TableGrid
        tables={tables}
        onSelectTable={handleSelectTable}
        onWaiterOrderClick={handleWaiterPersonalOrder}
      />

      {/* Cajón de Comanda en 3 Espacios */}
      <WaiterOrderDrawer
        isOpen={isDrawerOpen}
        table={selectedTable}
        isWaiterPersonalOrder={isPersonalOrder}
        waiterName={waiterName}
        categories={categories}
        menuItems={menuItems}
        onClose={() => setIsDrawerOpen(false)}
        onSubmitOrder={handleSubmitOrder}
      />
    </div>
  );
};
