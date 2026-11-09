import React from 'react';
import { RestaurantTable } from '../../domain/models';
import { UtensilsCrossed, Clock, User } from 'lucide-react';

interface TableGridProps {
  tables: RestaurantTable[];
  onSelectTable: (table: RestaurantTable) => void;
  onWaiterOrderClick: () => void;
}

export const TableGrid: React.FC<TableGridProps> = ({
  tables,
  onSelectTable,
  onWaiterOrderClick,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-400" />
            Mapa de Mesas del Salón
          </h3>
          <p className="text-xs text-slate-400">
            Verde = Vacía / Disponible · Naranja = Ocupada con comanda activa
          </p>
        </div>

        {/* Botón Pedido de Mesero */}
        <button
          onClick={onWaiterOrderClick}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <User className="w-4 h-4" />
          <span>Pedido de Mesero (Personal / Barra)</span>
        </button>
      </div>

      {/* Grid de Mesas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {tables.map((table) => {
          const isOccupied = table.status === 'ocupada';

          return (
            <button
              key={table.id || table.number}
              onClick={() => onSelectTable(table)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between h-36 relative overflow-hidden group ${
                isOccupied
                  ? 'bg-amber-950/30 border-amber-500/40 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-400/60 hover:bg-slate-900/90'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-2xl font-black text-white font-mono">
                  #{table.number}
                </span>

                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isOccupied
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {isOccupied ? 'Ocupada' : 'Libre'}
                </span>
              </div>

              {isOccupied ? (
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-300 truncate flex items-center gap-1">
                    <User className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{table.currentWaiterName || 'Mesero'}</span>
                  </div>
                  {table.openedAt && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{new Date(table.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-amber-300 font-bold mt-1 group-hover:underline">
                    + Adición / Ver
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 flex items-center justify-between w-full group-hover:text-emerald-300">
                  <span>Abrir comanda</span>
                  <span className="text-base font-bold">→</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
