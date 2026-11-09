import { useState, useRef, useEffect, useCallback } from 'react';

interface StealthTriggerOptions {
  requiredClicks?: number;
  timeWindowMs?: number;
  requireSpaceKey?: boolean;
  onTrigger: () => void;
}

export function useStealthTrigger({
  requiredClicks = 3,
  timeWindowMs = 2000,
  requireSpaceKey = true,
  onTrigger,
}: StealthTriggerOptions) {
  const [awaitingSpace, setAwaitingSpace] = useState(false);
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);
  const spaceTimeoutRef = useRef<number | null>(null);

  const registerClick = useCallback(() => {
    const now = Date.now();

    // Si ha pasado mucho tiempo desde el último click, reiniciar contador
    if (now - lastClickTimeRef.current > timeWindowMs) {
      clickCountRef.current = 1;
    } else {
      clickCountRef.current += 1;
    }
    lastClickTimeRef.current = now;

    // NO hay reacción visual ni háptica en 1 o 2 clics (requisito de sigilo BRP-AUT-01)
    if (clickCountRef.current >= requiredClicks) {
      clickCountRef.current = 0;

      if (requireSpaceKey) {
        setAwaitingSpace(true);
        // Esperar la tecla espacio durante 4 segundos
        if (spaceTimeoutRef.current) window.clearTimeout(spaceTimeoutRef.current);
        spaceTimeoutRef.current = window.setTimeout(() => {
          setAwaitingSpace(false);
        }, 4000);
      } else {
        onTrigger();
      }
    }
  }, [requiredClicks, timeWindowMs, requireSpaceKey, onTrigger]);

  // Escuchar tecla Space (Espacio)
  useEffect(() => {
    if (!awaitingSpace) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        setAwaitingSpace(false);
        if (spaceTimeoutRef.current) window.clearTimeout(spaceTimeoutRef.current);
        onTrigger();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [awaitingSpace, onTrigger]);

  return {
    registerClick,
    awaitingSpace,
    triggerDirectly: onTrigger,
  };
}
