import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  setDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { MenuCategory, MenuItem } from '../domain/models';

export const SEED_CATEGORIES: MenuCategory[] = [
  {
    id: 'cat_entradas',
    name: 'Entradas & Tapas',
    iconSvgName: 'salad',
    sortOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_fuertes',
    name: 'Platos Fuertes',
    iconSvgName: 'meat',
    sortOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_hamburguesas',
    name: 'Burgers Artesanales',
    iconSvgName: 'burger',
    sortOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_pizzas',
    name: 'Pizzas al Horno',
    iconSvgName: 'pizza',
    sortOrder: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_bebidas',
    name: 'Bebidas & Cócteles',
    iconSvgName: 'drinks',
    sortOrder: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_postres',
    name: 'Postres de Autor',
    iconSvgName: 'dessert',
    sortOrder: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const SEED_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item_1',
    categoryId: 'cat_entradas',
    name: 'Ceviche Mixto al Ají Amarillo',
    description: 'Pesca fresca del día, camarones tigres, leche de tigre cremosa, choclo crocante y camote glaseado.',
    price: 32000,
    imageUrl: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item_2',
    categoryId: 'cat_entradas',
    name: 'Croquetas de Jamón Ibérico',
    description: 'Cuatro unidades rellenas de bechamel suave, jamón serrano curado y un toque de alioli de trufa negra.',
    price: 24500,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item_3',
    categoryId: 'cat_fuertes',
    name: 'Lomo Fino al Grill 300g',
    description: 'Corte magro a la brasa, bañado en salsa de tres pimientas, puré rústico aromatizado con romero y espárragos.',
    price: 54000,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item_4',
    categoryId: 'cat_fuertes',
    name: 'Salmón Glaseado en Miso',
    description: 'Filete de salmón noruego a la plancha sobre cama de arroz basmati con jazmín, bok choy y reducción de mirin.',
    price: 49000,
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item_5',
    categoryId: 'cat_fuertes',
    name: 'Costillar BBQ Ahumado 12 Horas',
    description: 'Costillas de cerdo en cocción lenta a leña de nogal, bañadas en salsa BBQ de frutos rojos y papas en cascos.',
    price: 48500,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    isAvailable: false, // Probando estado agotado
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item_6',
    categoryId: 'cat_hamburguesas',
    name: 'Smash Burger Doble Trufa',
    description: 'Doble carne de res Angus smash, queso cheddar madurado, tocineta caramelizada y emulsión cremosa de trufa negra.',
    price: 36000,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item_7',
    categoryId: 'cat_hamburguesas',
    name: 'Burger Criolla Ahumada',
    description: 'Carne 200g, queso costeño frito, guacamole rústico, plátano maduro en almíbar de panela y mayonesa de cilantro.',
    price: 33500,
    imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item_8',
    categoryId: 'cat_pizzas',
    name: 'Pizza Burrata & Prosciutto',
    description: 'Masa madre 48h, salsa pomodoro San Marzano, mozzarella fior di latte, prosciutto di Parma y burrata fresca.',
    price: 42000,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item_9',
    categoryId: 'cat_bebidas',
    name: 'Gin Tonic de Frutos Rojos',
    description: 'Ginebra artesanal, agua tónica premium, bayas de enebro, infusión de frutos del bosque y piel de naranja.',
    price: 26000,
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item_10',
    categoryId: 'cat_bebidas',
    name: 'Limonada de Coco Frappé',
    description: 'Limón tahití natural batido con crema de coco orgánica, leche condensada y hielo granizado fino.',
    price: 14500,
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item_11',
    categoryId: 'cat_postres',
    name: 'Volcán de Chocolate Belga 70%',
    description: 'Bizcocho húmedo de cacao caliente con centro fundido, acompañado de helado artesanal de vainilla Bourbon.',
    price: 21000,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Formatea un número en pesos colombianos ($ 32.000)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Escucha categorías en Firestore en tiempo real con fallback inmediato a datos locales.
 */
export function subscribeToCategories(
  onCategoriesChanged: (categories: MenuCategory[]) => void
): () => void {
  try {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('sortOrder', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: MenuCategory[] = [];
          snapshot.forEach((d) => list.push({ ...(d.data() as MenuCategory), id: d.id }));
          onCategoriesChanged(list);
        } else {
          onCategoriesChanged(SEED_CATEGORIES);
        }
      },
      (error) => {
        console.warn('[menuService] Error leyendo categorías remotas, usando datos locales:', error);
        onCategoriesChanged(SEED_CATEGORIES);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[menuService] Firestore no inicializado, usando seed local:', err);
    onCategoriesChanged(SEED_CATEGORIES);
    return () => {};
  }
}

/**
 * Escucha productos del menú en tiempo real con fallback inmediato a datos locales.
 */
export function subscribeToMenuItems(
  onItemsChanged: (items: MenuItem[]) => void
): () => void {
  try {
    const itemsRef = collection(db, 'menu_items');
    const q = query(itemsRef, orderBy('sortOrder', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: MenuItem[] = [];
          snapshot.forEach((d) => list.push({ ...(d.data() as MenuItem), id: d.id }));
          onItemsChanged(list);
        } else {
          onItemsChanged(SEED_MENU_ITEMS);
        }
      },
      (error) => {
        console.warn('[menuService] Error leyendo productos remotos, usando datos locales:', error);
        onItemsChanged(SEED_MENU_ITEMS);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[menuService] Firestore no inicializado, usando seed local:', err);
    onItemsChanged(SEED_MENU_ITEMS);
    return () => {};
  }
}
