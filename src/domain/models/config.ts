export type PlanTier = 'start' | 'pro' | 'business';

export interface RestaurantConfig {
  restaurantName: string;
  legalDocument: string;
  address: string;
  phone: string;
  currency: 'COP' | 'USD';
  plan: PlanTier;
  hasThematicDesign: boolean;
  settings: {
    suggestedTipPercentage: number;
    receiptLegalLegend: string;
    orderConsecutiveDaily: number;
    consecutiveDate: string;
  };
  socialLinks?: {
    whatsappUrl?: string;
    googleMapsReviewUrl?: string;
    instagramUrl?: string;
  };
  updatedAt: string;
}
