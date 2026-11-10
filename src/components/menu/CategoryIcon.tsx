import React from 'react';
import { Utensils } from 'lucide-react';
import { VECTOR_ICONS_MAP } from '../../config/icons.catalog';

interface CategoryIconProps {
  /**
   * Identificador único del icono vectorial del catálogo (ej: 'flame', 'beef', 'pizza', 'wine')
   */
  iconName: string;
  className?: string;
}

/**
 * Componente que renderiza un icono vectorial SVG a partir de su ID en el catálogo.
 * Mantiene la separación de entidades: un icono es un recurso visual gráfico,
 * mientras que la categoría es una entidad del menú que referencia dicho icono.
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  className = 'w-5 h-5',
}) => {
  const normalizedId = (iconName || '').toLowerCase().trim();

  // Mapeo retrocompatible de claves heredadas hacia IDs canónicos del catálogo
  let canonicalId = normalizedId;
  if (normalizedId === 'all') canonicalId = 'sparkles';
  if (normalizedId === 'drinks') canonicalId = 'wine';
  if (normalizedId === 'burger') canonicalId = 'sandwich';
  if (normalizedId === 'meat') canonicalId = 'beef';

  const IconComponent = VECTOR_ICONS_MAP[canonicalId] || Utensils;

  return <IconComponent className={className} />;
};
