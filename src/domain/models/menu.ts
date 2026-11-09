export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number; // Precio neto en moneda local (IVA ya incluido)
  imageUrl: string;
  imageStoragePath?: string;
  isAvailable: boolean;
  sortOrder: number; // Uso estrictamente interno
  createdAt: string;
  updatedAt: string;
}
