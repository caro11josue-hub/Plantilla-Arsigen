import React from 'react';
import { ShieldAlert, Terminal } from 'lucide-react';
import { PlanTier } from '../../domain/models';

interface DeveloperFloatingTriggerProps {
  currentPlan: PlanTier;
  onClick: () => void;
}

export const DeveloperFloatingTrigger: React.FC<DeveloperFloatingTriggerProps> = ({
  currentPlan,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      title="Panel de Desarrollador ARSIGEN"
      aria-label="Panel de Desarrollador"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-blue-500/30 backdrop-blur-md shadow-lg shadow-black/40 transition-all hover:scale-105 active:scale-95 group"
    >
      <Terminal className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
      <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
        DEV: {currentPlan}
      </span>
    </button>
  );
};
