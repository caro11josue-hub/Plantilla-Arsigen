import React from 'react';
import {
  Utensils,
  UtensilsCrossed,
  ChefHat,
  CookingPot,
  Flame,
  Sparkles,
  Star,
  Beef,
  Drumstick,
  Fish,
  Ham,
  Egg,
  Pizza,
  Sandwich,
  Salad,
  Soup,
  Popcorn,
  Wheat,
  Croissant,
  Cookie,
  Cake,
  IceCream,
  Dessert,
  Candy,
  Donut,
  Coffee,
  Wine,
  Beer,
  GlassWater,
  CupSoda,
  Martini,
  Milk,
  Hop,
  Apple,
  Citrus,
  Carrot,
  Grape,
  Banana,
  Cherry,
  Nut,
  CircleDot,
  LucideIcon,
} from 'lucide-react';

export type IconGroup =
  | 'cocina'
  | 'proteinas'
  | 'platos'
  | 'bebidas'
  | 'dulces'
  | 'frescos'
  | 'insignias';

export interface VectorIconItem {
  id: string;
  label: string;
  group: IconGroup;
  icon: LucideIcon;
}

/**
 * Catálogo central de iconos vectoriales SVG para la plataforma.
 * Esta entidad es independiente de cualquier categoría o negocio en particular.
 * Las categorías del menú simplemente referencian un `id` de este catálogo.
 */
export const VECTOR_ICONS_CATALOG: VectorIconItem[] = [
  // Cocina & Preparación
  { id: 'flame', label: 'Fuego / Brasa', group: 'cocina', icon: Flame },
  { id: 'chef-hat', label: 'Gorro de Chef', group: 'cocina', icon: ChefHat },
  { id: 'cooking-pot', label: 'Olla / Cazuela', group: 'cocina', icon: CookingPot },
  { id: 'utensils', label: 'Cubiertos', group: 'cocina', icon: Utensils },
  { id: 'utensils-crossed', label: 'Cubiertos Cruzados', group: 'cocina', icon: UtensilsCrossed },

  // Proteínas & Carnes
  { id: 'beef', label: 'Corte Vacuno', group: 'proteinas', icon: Beef },
  { id: 'drumstick', label: 'Ave / Pollo', group: 'proteinas', icon: Drumstick },
  { id: 'fish', label: 'Pescado / Del Mar', group: 'proteinas', icon: Fish },
  { id: 'ham', label: 'Jamón / Embutidos', group: 'proteinas', icon: Ham },
  { id: 'egg', label: 'Huevo / Desayuno', group: 'proteinas', icon: Egg },

  // Platos & Preparaciones
  { id: 'sandwich', label: 'Sándwich / Burger', group: 'platos', icon: Sandwich },
  { id: 'pizza', label: 'Pizza al Horno', group: 'platos', icon: Pizza },
  { id: 'salad', label: 'Ensalada / Bowls', group: 'platos', icon: Salad },
  { id: 'soup', label: 'Sopa / Caldo', group: 'platos', icon: Soup },
  { id: 'popcorn', label: 'Snacks / Pasabocas', group: 'platos', icon: Popcorn },
  { id: 'croissant', label: 'Croissant / Hojaldre', group: 'platos', icon: Croissant },
  { id: 'wheat', label: 'Trigo / Panadería', group: 'platos', icon: Wheat },

  // Bebidas
  { id: 'wine', label: 'Copa de Vino', group: 'bebidas', icon: Wine },
  { id: 'beer', label: 'Cerveza', group: 'bebidas', icon: Beer },
  { id: 'coffee', label: 'Café Caliente', group: 'bebidas', icon: Coffee },
  { id: 'glass-water', label: 'Vaso de Agua', group: 'bebidas', icon: GlassWater },
  { id: 'cup-soda', label: 'Gaseosa / Refresco', group: 'bebidas', icon: CupSoda },
  { id: 'martini', label: 'Cóctel / Martini', group: 'bebidas', icon: Martini },
  { id: 'milk', label: 'Lácteos / Batidos', group: 'bebidas', icon: Milk },
  { id: 'hop', label: 'Lúpulo / Artesanal', group: 'bebidas', icon: Hop },

  // Postres & Repostería
  { id: 'cake', label: 'Pastel / Torta', group: 'dulces', icon: Cake },
  { id: 'ice-cream', label: 'Helado', group: 'dulces', icon: IceCream },
  { id: 'dessert', label: 'Postre', group: 'dulces', icon: Dessert },
  { id: 'cookie', label: 'Galleta', group: 'dulces', icon: Cookie },
  { id: 'donut', label: 'Dona / Rosquilla', group: 'dulces', icon: Donut },
  { id: 'candy', label: 'Dulce / Confitería', group: 'dulces', icon: Candy },

  // Frescos & Botánicos
  { id: 'apple', label: 'Manzana / Frutas', group: 'frescos', icon: Apple },
  { id: 'citrus', label: 'Cítricos / Limón', group: 'frescos', icon: Citrus },
  { id: 'carrot', label: 'Vegetales / Huerto', group: 'frescos', icon: Carrot },
  { id: 'grape', label: 'Uvas / Viñedo', group: 'frescos', icon: Grape },
  { id: 'banana', label: 'Plátano / Frutas', group: 'frescos', icon: Banana },
  { id: 'cherry', label: 'Cerezas / Berries', group: 'frescos', icon: Cherry },
  { id: 'nut', label: 'Frutos Secos', group: 'frescos', icon: Nut },

  // Distintivos & Destacados
  { id: 'sparkles', label: 'Especial / Todo', group: 'insignias', icon: Sparkles },
  { id: 'star', label: 'Destacado / Estrella', group: 'insignias', icon: Star },
  { id: 'circle-dot', label: 'Punto / General', group: 'insignias', icon: CircleDot },
];

/**
 * Diccionario de búsqueda rápida O(1) de icono por su identificador único.
 */
export const VECTOR_ICONS_MAP: Record<string, LucideIcon> = Object.fromEntries(
  VECTOR_ICONS_CATALOG.map((item) => [item.id, item.icon])
);

/**
 * Grupos disponibles para filtrado en el selector de iconos.
 */
export const ICON_GROUPS: { id: IconGroup | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'cocina', label: 'Cocina & Fuego' },
  { id: 'proteinas', label: 'Carnes & Proteínas' },
  { id: 'platos', label: 'Platos & Panadería' },
  { id: 'bebidas', label: 'Bebidas & Licores' },
  { id: 'dulces', label: 'Postres & Dulces' },
  { id: 'frescos', label: 'Frutas & Vegetales' },
  { id: 'insignias', label: 'Especiales' },
];
