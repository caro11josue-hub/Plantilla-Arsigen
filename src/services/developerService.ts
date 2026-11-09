import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PlanTier, RestaurantConfig } from '../domain/models';

const CONFIG_DOC_PATH = 'config/general';

export const DEFAULT_RESTAURANT_CONFIG: RestaurantConfig = {
  restaurantName: 'ARSIGEN GastroPOS',
  legalDocument: 'NIT: 901.482.119-3',
  address: 'Calle Principal #10-20',
  phone: '+57 314 464 0776',
  currency: 'COP',
  plan: 'start',
  hasThematicDesign: false,
  settings: {
    suggestedTipPercentage: 10,
    receiptLegalLegend: 'Comprobante de consumo interno / No válido como factura fiscal',
    orderConsecutiveDaily: 1,
    consecutiveDate: new Date().toISOString().slice(0, 10),
  },
  socialLinks: {
    whatsappUrl: 'https://wa.me/573144640776',
    googleMapsReviewUrl: '',
    instagramUrl: '',
  },
  updatedAt: new Date().toISOString(),
};

/**
 * Obtiene la configuración general del restaurante en tiempo real.
 */
export async function getRestaurantConfig(): Promise<RestaurantConfig> {
  try {
    const configRef = doc(db, CONFIG_DOC_PATH);
    const snap = await getDoc(configRef);
    if (snap.exists()) {
      return snap.data() as RestaurantConfig;
    }
  } catch (err) {
    console.warn('[developerService] No se pudo leer config remota, usando valores por defecto:', err);
  }
  return DEFAULT_RESTAURANT_CONFIG;
}

/**
 * Actualiza el plan activo del restaurante en vivo desde el panel de desarrollador
 * sin requerir redespliegue de código.
 */
export async function updateRestaurantPlan(newPlan: PlanTier): Promise<void> {
  const configRef = doc(db, CONFIG_DOC_PATH);
  await updateDoc(configRef, {
    plan: newPlan,
    updatedAt: new Date().toISOString(),
  }).catch(async () => {
    // Si no existía, inicializarlo
    await setDoc(configRef, {
      ...DEFAULT_RESTAURANT_CONFIG,
      plan: newPlan,
      updatedAt: new Date().toISOString(),
    });
  });
}

/**
 * Aprovisionamiento inicial del restaurante por parte del Desarrollador.
 */
export async function provisionInitialRestaurant(customConfig?: Partial<RestaurantConfig>): Promise<void> {
  const configRef = doc(db, CONFIG_DOC_PATH);
  const data: RestaurantConfig = {
    ...DEFAULT_RESTAURANT_CONFIG,
    ...customConfig,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(configRef, data, { merge: true });
}
