import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, resultCount }) => {
  return (
    <div className="relative w-full max-w-xl mx-auto mb-6">
      <div className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar plato, ingrediente o bebida..."
          className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-900/70 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-md transition-all shadow-lg"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3.5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {value && resultCount !== undefined && (
        <div className="mt-2 text-xs text-slate-400 px-2 flex items-center justify-between">
          <span>Resultados para "{value}":</span>
          <span className="font-semibold text-blue-400">{resultCount} platos encontrados</span>
        </div>
      )}
    </div>
  );
};
