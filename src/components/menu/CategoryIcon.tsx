import React from 'react';
import {
  Utensils,
  Pizza,
  Coffee,
  Beer,
  Wine,
  IceCream,
  Salad,
  Flame,
  Soup,
  Fish,
  Beef,
  Sandwich,
  Sparkles,
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = 'w-5 h-5' }) => {
  switch (iconName.toLowerCase()) {
    case 'burger':
    case 'hamburguesa':
      return <Sandwich className={className} />;
    case 'meat':
    case 'carne':
    case 'parrilla':
    case 'bbq':
      return <Beef className={className} />;
    case 'flame':
    case 'especial':
      return <Flame className={className} />;
    case 'pizza':
      return <Pizza className={className} />;
    case 'coffee':
    case 'cafe':
      return <Coffee className={className} />;
    case 'drink':
    case 'drinks':
    case 'bebidas':
      return <Wine className={className} />;
    case 'beer':
    case 'cerveza':
      return <Beer className={className} />;
    case 'dessert':
    case 'postre':
    case 'helado':
      return <IceCream className={className} />;
    case 'salad':
    case 'ensalada':
      return <Salad className={className} />;
    case 'soup':
    case 'sopa':
      return <Soup className={className} />;
    case 'fish':
    case 'mariscos':
    case 'pescado':
      return <Fish className={className} />;
    case 'all':
    case 'todo':
      return <Sparkles className={className} />;
    default:
      return <Utensils className={className} />;
  }
};
