import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  defaultStudioData,
  type PortfolioCase,
  type PromoItem,
  type QuoteRequest,
  type RequestStatus,
  type ServiceItem,
  type StudioData,
  type StudioSettings,
} from "./graffar-data";

export type ThemeMode = "dark" | "light";
export type CookieConsent = "unset" | "all" | "essential";

type GraffarStore = StudioData & {
  theme: ThemeMode;
  cookieConsent: CookieConsent;
  adminSessionToken: string | null;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setCookieConsent: (choice: CookieConsent) => void;
  setAdminSessionToken: (token: string | null) => void;
  setRequests: (requests: QuoteRequest[]) => void;
  updateSettings: (partial: Partial<StudioSettings>) => void;
  updateLegal: (partial: Partial<StudioSettings["legal"]>) => void;
  upsertService: (service: ServiceItem) => void;
  removeService: (id: string) => void;
  toggleServiceActive: (id: string) => void;
  upsertCase: (item: PortfolioCase) => void;
  removeCase: (id: string) => void;
  upsertPromo: (promo: PromoItem) => void;
  removePromo: (id: string) => void;
  addRequest: (req: QuoteRequest) => void;
  setRequestStatus: (id: string, status: RequestStatus) => void;
  removeRequest: (id: string) => void;
  importJsonState: (raw: string) => { ok: boolean; error?: string };
  resetToDefaults: () => void;
};

export const useGraffarStore = create<GraffarStore>()(
  persist(
    (set, get) => ({
      ...defaultStudioData(),
      theme: "dark",
      cookieConsent: "unset",
      adminSessionToken: null,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setCookieConsent: (cookieConsent) => set({ cookieConsent }),
      setAdminSessionToken: (adminSessionToken) => set({ adminSessionToken }),
      setRequests: (requests) => set({ requests }),
      updateSettings: (partial) =>
        set((s) => ({
          settings: { ...s.settings, ...partial },
        })),
      updateLegal: (partial) =>
        set((s) => ({
          settings: {
            ...s.settings,
            legal: { ...s.settings.legal, ...partial },
          },
        })),
      upsertService: (service) =>
        set((s) => ({
          services: s.services.some((item) => item.id === service.id)
            ? s.services.map((item) => (item.id === service.id ? service : item))
            : [...s.services, service],
        })),
      removeService: (id) =>
        set((s) => ({
          services: s.services.filter((item) => item.id !== id),
        })),
      toggleServiceActive: (id) =>
        set((s) => ({
          services: s.services.map((item) =>
            item.id === id ? { ...item, active: !item.active } : item,
          ),
        })),
      upsertCase: (item) =>
        set((s) => ({
          portfolio: s.portfolio.some((c) => c.id === item.id)
            ? s.portfolio.map((c) => (c.id === item.id ? item : c))
            : [item, ...s.portfolio],
        })),
      removeCase: (id) =>
        set((s) => ({
          portfolio: s.portfolio.filter((c) => c.id !== id),
        })),
      upsertPromo: (promo) =>
        set((s) => ({
          promos: (s.promos ?? []).some((p) => p.id === promo.id)
            ? (s.promos ?? []).map((p) => (p.id === promo.id ? promo : p))
            : [...(s.promos ?? []), promo],
        })),
      removePromo: (id) =>
        set((s) => ({
          promos: (s.promos ?? []).filter((p) => p.id !== id),
        })),
      addRequest: (req) =>
        set((s) => ({
          requests: [req, ...s.requests.filter((r) => r.id !== req.id)],
        })),
      setRequestStatus: (id, status) =>
        set((s) => ({
          requests: s.requests.map((r) => (r.id === id ? { ...r, status } : r)),
        })),
      removeRequest: (id) =>
        set((s) => ({
          requests: s.requests.filter((r) => r.id !== id),
        })),
      importJsonState: (raw) => {
        try {
          const parsed = JSON.parse(raw) as Partial<StudioData>;
          if (
            !parsed ||
            typeof parsed !== "object" ||
            !Array.isArray(parsed.services) ||
            !Array.isArray(parsed.portfolio) ||
            !parsed.settings
          ) {
            return {
              ok: false,
              error: "Некорректная структура JSON (ожидаются settings, services, portfolio).",
            };
          }
          const base = defaultStudioData();
          set({
            settings: {
              ...base.settings,
              ...parsed.settings,
              legal: { ...base.settings.legal, ...(parsed.settings.legal ?? {}) },
            },
            services: parsed.services,
            portfolio: parsed.portfolio,
            promos: Array.isArray(parsed.promos) ? parsed.promos : base.promos,
            requests: Array.isArray(parsed.requests) ? parsed.requests : get().requests,
          });
          return { ok: true };
        } catch {
          return { ok: false, error: "Не удалось разобрать JSON-файл." };
        }
      },
      resetToDefaults: () => {
        const fresh = defaultStudioData();
        set({
          settings: fresh.settings,
          services: fresh.services,
          portfolio: fresh.portfolio,
          promos: fresh.promos,
        });
      },
    }),
    {
      name: "graffar-studio-v1",
      skipHydration: true,
      partialize: (state) => ({
        settings: state.settings,
        services: state.services,
        portfolio: state.portfolio,
        promos: state.promos,
        requests: state.requests,
        theme: state.theme,
        cookieConsent: state.cookieConsent,
      }),
      merge: (persistedState, currentState) => {
        const p = (persistedState as Partial<GraffarStore>) || {};
        return {
          ...currentState,
          ...p,
          adminSessionToken: null,
          settings: {
            ...currentState.settings,
            ...(p.settings || {}),
            legal: {
              ...currentState.settings.legal,
              ...(p.settings?.legal || {}),
            },
          },
          promos: Array.isArray(p.promos) ? p.promos : currentState.promos,
        };
      },
    },
  ),
);
