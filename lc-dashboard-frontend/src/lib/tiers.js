// Tier definitions
export const TIERS = {
  FREE: "free",
  PREMIUM: "premium",
};

export const TIER_FEATURES = {
  [TIERS.FREE]: {
    name: "Free",
    price: 0,
    maxDaysHistory: 30,
    hasAds: true,
    canExport: false,
    maxSnapshots: 5,
  },
  [TIERS.PREMIUM]: {
    name: "Premium",
    price: 9.99,
    maxDaysHistory: 365,
    hasAds: false,
    canExport: true,
    maxSnapshots: Infinity,
  },
};

export function getUserTier(user) {
  return user?.tier || TIERS.FREE;
}

export function canAccessFeature(tier, feature) {
  return TIER_FEATURES[tier]?.[feature];
}
