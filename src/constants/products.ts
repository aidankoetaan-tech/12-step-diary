// RevenueCat entitlement + product identifiers and the marketing copy
// shown on the paywall. The store-configured prices are the source of
// truth at runtime; the values here are display fallbacks used when the
// store / RevenueCat is unavailable (e.g. Expo Go preview mode).

// The single entitlement that unlocks every paid feature. Configure an
// entitlement with this identifier in the RevenueCat dashboard and attach
// all three products (monthly, annual, lifetime) to it.
export const PREMIUM_ENTITLEMENT = 'premium';

// Product identifiers — must match App Store Connect / Play Console and the
// products you attach to the entitlement in RevenueCat.
export const PRODUCT_IDS = {
  monthly: 'rc_premium_monthly',
  annual: 'rc_premium_annual',
  lifetime: 'rc_premium_lifetime',
} as const;

export type PlanKey = keyof typeof PRODUCT_IDS;

export interface PlanDisplay {
  key: PlanKey;
  name: string;
  priceFallback: string;
  cadence: string;
  highlight?: string;
  recommended?: boolean;
}

export const PLAN_DISPLAY: PlanDisplay[] = [
  {
    key: 'annual',
    name: 'Annual',
    priceFallback: '$44.99',
    cadence: 'per year',
    highlight: 'Best value — under $4/mo',
    recommended: true,
  },
  {
    key: 'monthly',
    name: 'Monthly',
    priceFallback: '$8.99',
    cadence: 'per month',
  },
  {
    key: 'lifetime',
    name: 'Lifetime',
    priceFallback: '$79.99',
    cadence: 'one time',
    highlight: 'Pay once. Yours forever.',
  },
];

// Features listed on the paywall.
export const PREMIUM_FEATURES = [
  'Full guided stepwork — all 12 steps with prompts',
  'Export your journal & stepwork (text, CSV, backup)',
  'Sponsor sharing',
  'Encrypted backup',
];
