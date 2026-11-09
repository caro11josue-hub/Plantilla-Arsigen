/**
 * Sistema de Tokens de Diseño para ARSIGEN GastroPOS
 * Plantilla Base: "Bistró & Leña · Fuego Sagrado"
 * Estética: Dark Glassmorphism Culinario, Resplandor de Brasas y Motion Fluido
 */
export const THEME_CONFIG = {
  colors: {
    // Fondos atmosféricos de carbón profundo
    bgDeep: '#070B14',
    bgSurface: '#0D1117',
    bgCardGlass: 'rgba(255, 255, 255, 0.03)',
    borderGlass: 'rgba(255, 255, 255, 0.08)',
    borderGlassHover: 'rgba(245, 158, 11, 0.25)',

    // Acentos temáticos de brasa y fuego
    accentAmber: '#F59E0B',
    accentFlame: '#EA580C',
    accentCopper: '#D97706',
    accentRosemary: '#10B981',

    // Semáforo de Mesas (Salón / Caja)
    tableFree: '#10B981',       // Verde Esmeralda: Mesa Vacía
    tableUnprinted: '#F59E0B',  // Ámbar Fuego Pulsante: Sin Imprimir / Alerta Comanda
    tableOccupied: '#3B82F6',   // Azul Cobalto: Ocupada e Impresa
    tablePaid: '#64748B',       // Gris Pizarra: Pagada / Finalizada
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    fontMono: "'Space Mono', monospace", // Formato estricto para tickets de 32 columnas
  },
  motion: {
    transitionSmooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
    durationNormal: 0.28,
  },
};
