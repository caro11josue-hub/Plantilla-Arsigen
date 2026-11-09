/**
 * Sistema de Tokens de Diseño para ARSIGEN GastroPOS
 * Estética: Dark Glassmorphism Minimalista
 */
export const THEME_CONFIG = {
  colors: {
    bgDeep: '#070B14',
    bgSurface: 'rgba(15, 23, 42, 0.65)',
    bgCardGlass: 'rgba(255, 255, 255, 0.04)',
    borderGlass: 'rgba(255, 255, 255, 0.08)',
    borderGlassHover: 'rgba(255, 255, 255, 0.18)',
    accentBlue: '#3B82F6',
    
    // Semáforo de Mesas (Salón / Caja)
    tableFree: '#10B981',       // Esmeralda: Mesa Vacía
    tableUnprinted: '#F59E0B',  // Ámbar Pulsante: Sin Imprimir / Alerta
    tableOccupied: '#3B82F6',   // Azul Cobalto: Ocupada e Impresa
    tablePaid: '#64748B',       // Slate: Pagada / Finalizada
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    fontMono: "'Space Mono', monospace", // Para impresión y emulador de 32 columnas
  },
  springPhysics: {
    stiffness: 300,
    damping: 25,
  },
};
