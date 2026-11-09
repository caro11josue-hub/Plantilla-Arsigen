import { PlanTier } from '../domain/models';

export interface PlanCapabilities {
  tier: PlanTier;
  allowAdminMenuEdit: boolean;
  allowStockToggle: boolean;
  allowWaiterModule: boolean;
  allowKitchenComandas: boolean;
  allowThermalPrinter: boolean;
  allowFinancialStats: boolean;
  allowSocialLinks: boolean;
  allowGoogleMapsReview: boolean;
  maxProducts: number;
  maxTables: number;
}

export const CAPABILITIES: Record<PlanTier, PlanCapabilities> = {
  start: {
    tier: 'start',
    allowAdminMenuEdit: false,
    allowStockToggle: false,
    allowWaiterModule: false,
    allowKitchenComandas: false,
    allowThermalPrinter: false,
    allowFinancialStats: false,
    allowSocialLinks: false,
    allowGoogleMapsReview: false,
    maxProducts: 35,
    maxTables: 0,
  },
  pro: {
    tier: 'pro',
    allowAdminMenuEdit: true,
    allowStockToggle: true,
    allowWaiterModule: false,
    allowKitchenComandas: false,
    allowThermalPrinter: false,
    allowFinancialStats: false,
    allowSocialLinks: true,
    allowGoogleMapsReview: true,
    maxProducts: 50,
    maxTables: 0,
  },
  business: {
    tier: 'business',
    allowAdminMenuEdit: true,
    allowStockToggle: true,
    allowWaiterModule: true,
    allowKitchenComandas: true,
    allowThermalPrinter: true,
    allowFinancialStats: true,
    allowSocialLinks: true,
    allowGoogleMapsReview: true,
    maxProducts: 9999,
    maxTables: 70,
  },
};

/**
 * Obtiene las capacidades efectivas para un plan dado.
 */
export function getCapabilitiesForPlan(plan: PlanTier): PlanCapabilities {
  return CAPABILITIES[plan] || CAPABILITIES.start;
}
