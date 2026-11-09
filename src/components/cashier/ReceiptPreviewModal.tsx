import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FormattedTicket } from '../../services/printerService';
import { X, Printer, CheckCircle2 } from 'lucide-react';

interface ReceiptPreviewModalProps {
  isOpen: boolean;
  ticket: FormattedTicket | null;
  ticketTitle: string;
  onClose: () => void;
  onConfirmPrint: () => void;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  isOpen,
  ticket,
  ticketTitle,
  onClose,
  onConfirmPrint,
}) => {
  if (!isOpen || !ticket) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-3 bg-slate-900 border border-white/10 rounded-t-2xl flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider">{ticketTitle}</span>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Papel Térmico de 58 mm (32 Columnas Monospace) */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#f8fafc] text-[#0f172a] font-mono text-[11px] leading-tight shadow-2xl border-x border-slate-300 select-all">
            <pre className="whitespace-pre font-mono font-semibold">
              {ticket.rawText}
            </pre>
          </div>

          {/* Footer de Corte de Papel y Envío */}
          <div className="p-3 bg-slate-900 border border-white/10 rounded-b-2xl flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400">Ancho: 58mm (32 col)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cerrar
              </button>
              <button
                onClick={onConfirmPrint}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
