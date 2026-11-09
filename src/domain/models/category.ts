export interface MenuCategory {
  id: string;
  name: string;
  iconSvgName: string; // Identificador SVG predefinido (ej: 'burger', 'pizza', 'drink', 'coffee', 'dessert')
  sortOrder: number;   // Uso estrictamente interno para ordenar, nunca expuesto al comensal
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
