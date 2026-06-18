import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesPackage,
} from 'react-native-purchases';
import { PLAN_DISPLAY, PlanKey, PREMIUM_ENTITLEMENT, PRODUCT_IDS } from '../constants/products';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

interface EntitlementContextValue {
  ready: boolean;
  isPremium: boolean;
  // True when RevenueCat is configured with a real API key. When false the
  // app runs in a "free, store-unavailable" mode (e.g. Expo Go without keys).
  storeReady: boolean;
  // Packages available to purchase, keyed by plan. May be empty if the store
  // is unavailable; the paywall falls back to display-only pricing.
  packages: Partial<Record<PlanKey, PurchasesPackage>>;
  purchase: (plan: PlanKey) => Promise<boolean>;
  restore: () => Promise<boolean>;
  // Local-only override for previewing premium screens in development.
  devPremium: boolean;
  toggleDevPremium: () => void;
}

const EntitlementContext = createContext<EntitlementContextValue | undefined>(undefined);

function hasPremium(info: CustomerInfo | null): boolean {
  if (!info) return false;
  return typeof info.entitlements.active[PREMIUM_ENTITLEMENT] !== 'undefined';
}

export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [storeReady, setStoreReady] = useState(false);
  const [entitled, setEntitled] = useState(false);
  const [packages, setPackages] = useState<Partial<Record<PlanKey, PurchasesPackage>>>({});
  const [devPremium, setDevPremium] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function configure() {
      const apiKey = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
      if (!apiKey) {
        // No key configured — operate as free with store disabled.
        if (!cancelled) setReady(true);
        return;
      }
      try {
        if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.WARN);
        Purchases.configure({ apiKey });

        Purchases.addCustomerInfoUpdateListener((info) => {
          if (!cancelled) setEntitled(hasPremium(info));
        });

        const info = await Purchases.getCustomerInfo();
        if (cancelled) return;
        setEntitled(hasPremium(info));

        await loadOfferings();
        if (!cancelled) setStoreReady(true);
      } catch {
        // Leave store disabled; app still works as free.
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    async function loadOfferings() {
      try {
        const offerings = await Purchases.getOfferings();
        const current = offerings.current;
        if (!current) return;
        const byPlan: Partial<Record<PlanKey, PurchasesPackage>> = {};
        for (const pkg of current.availablePackages) {
          const id = pkg.product.identifier;
          (Object.keys(PRODUCT_IDS) as PlanKey[]).forEach((plan) => {
            if (PRODUCT_IDS[plan] === id) byPlan[plan] = pkg;
          });
        }
        if (!cancelled) setPackages(byPlan);
      } catch {
        // Offerings unavailable — paywall uses display fallbacks.
      }
    }

    configure();
    return () => {
      cancelled = true;
    };
  }, []);

  const purchase = useCallback(
    async (plan: PlanKey): Promise<boolean> => {
      const pkg = packages[plan];
      if (!pkg) return false;
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        const ok = hasPremium(customerInfo);
        setEntitled(ok);
        return ok;
      } catch {
        // userCancelled is a normal, non-error outcome.
        return false;
      }
    },
    [packages],
  );

  const restore = useCallback(async (): Promise<boolean> => {
    try {
      const info = await Purchases.restorePurchases();
      const ok = hasPremium(info);
      setEntitled(ok);
      return ok;
    } catch {
      return false;
    }
  }, []);

  const toggleDevPremium = useCallback(() => setDevPremium((v) => !v), []);

  const value = useMemo(
    () => ({
      ready,
      isPremium: entitled || (__DEV__ && devPremium),
      storeReady,
      packages,
      purchase,
      restore,
      devPremium,
      toggleDevPremium,
    }),
    [ready, entitled, devPremium, storeReady, packages, purchase, restore, toggleDevPremium],
  );

  return <EntitlementContext.Provider value={value}>{children}</EntitlementContext.Provider>;
}

export function useEntitlement(): EntitlementContextValue {
  const ctx = useContext(EntitlementContext);
  if (!ctx) throw new Error('useEntitlement must be used within an EntitlementProvider');
  return ctx;
}

// Convenience for the paywall to merge live packages with display copy.
export function planRows(packages: Partial<Record<PlanKey, PurchasesPackage>>) {
  return PLAN_DISPLAY.map((d) => ({
    ...d,
    pkg: packages[d.key],
    priceString: packages[d.key]?.product.priceString ?? d.priceFallback,
  }));
}
