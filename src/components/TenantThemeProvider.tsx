"use client";

import { useEffect, useState, useRef, createContext, useContext } from "react";
import { useSession } from "next-auth/react";

interface TenantTheme {
  name: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
}

const DEFAULT_THEME: TenantTheme = {
  name: "",
  logo: null,
  primaryColor: "#1a365d",
  secondaryColor: "#e2e8f0",
};

const TenantThemeContext = createContext<TenantTheme>(DEFAULT_THEME);

export function useTenantTheme() {
  return useContext(TenantThemeContext);
}

/**
 * Converte hex (#rrggbb) para componentes oklch aproximados.
 * Usa conversao hex -> sRGB -> linear RGB -> OKLab -> OKLCH.
 */
function hexToOklch(hex: string): { l: number; c: number; h: number } {
  const r8 = parseInt(hex.slice(1, 3), 16);
  const g8 = parseInt(hex.slice(3, 5), 16);
  const b8 = parseInt(hex.slice(5, 7), 16);

  // sRGB [0,1]
  const sr = r8 / 255;
  const sg = g8 / 255;
  const sb = b8 / 255;

  // sRGB -> linear
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const lr = toLinear(sr);
  const lg = toLinear(sg);
  const lb = toLinear(sb);

  // Linear RGB -> OKLab (via LMS)
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + b2 * b2);
  let H = (Math.atan2(b2, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
}

function oklchString(l: number, c: number, h: number): string {
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
}

/**
 * Calcula luminancia relativa para decidir se o foreground deve ser claro ou escuro.
 */
function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function applyThemeToDOM(theme: TenantTheme, isDark: boolean) {
  const root = document.documentElement;
  const primary = theme.primaryColor;
  const { l, c, h } = hexToOklch(primary);

  // Light mode: usar a cor diretamente
  // Dark mode: clarear um pouco para manter visibilidade
  const lightL = l;
  const darkL = Math.min(l + 0.15, 0.85);

  const effectiveL = isDark ? darkL : lightL;
  root.style.setProperty("--primary", oklchString(effectiveL, c, h));
  root.style.setProperty("--ring", oklchString(effectiveL, c, h));
  root.style.setProperty("--chart-1", oklchString(effectiveL, c, h));

  // Foreground: branco se cor escura, escuro se cor clara
  const lum = relativeLuminance(primary);
  if (isDark) {
    root.style.setProperty("--primary-foreground", oklchString(0.15, 0, 0));
  } else {
    root.style.setProperty(
      "--primary-foreground",
      lum > 0.4 ? oklchString(0.15, 0, 0) : oklchString(0.98, 0, 0)
    );
  }

  // Accent com toque da cor primaria
  if (isDark) {
    root.style.setProperty("--accent", oklchString(0.3, c * 0.25, h));
    root.style.setProperty("--accent-foreground", oklchString(0.96, 0, 0));
  } else {
    root.style.setProperty("--accent", oklchString(0.93, c * 0.2, h));
    root.style.setProperty("--accent-foreground", oklchString(0.35, c * 0.5, h));
  }

  // CSS custom property para uso direto em componentes
  root.style.setProperty("--tenant-primary", primary);
}

export default function TenantThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<TenantTheme>(DEFAULT_THEME);

  const tenantId = session?.user?.tenantId as string | undefined;

  const prevTenantId = useRef<string | undefined>(undefined);

  // Fetch theme quando tenantId muda (inclui mount inicial e tenant switch)
  // O fetch e disparado pelo effect mas o setState acontece no callback assincrono,
  // nao sincronamente dentro do effect body.
  useEffect(() => {
    if (!tenantId || tenantId === prevTenantId.current) return;
    prevTenantId.current = tenantId;

    let cancelled = false;

    fetch("/api/tenant/theme")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.success && json.data) {
          setTheme(json.data);
        }
      })
      .catch(() => {
        // Silently fail, keep defaults
      });

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  // Aplicar tema ao DOM
  useEffect(() => {
    if (!theme.primaryColor) return;

    const isDark = document.documentElement.classList.contains("dark");
    applyThemeToDOM(theme, isDark);

    // Observer para reagir a mudancas de dark mode
    const observer = new MutationObserver(() => {
      const nowDark = document.documentElement.classList.contains("dark");
      applyThemeToDOM(theme, nowDark);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [theme]);

  return <TenantThemeContext.Provider value={theme}>{children}</TenantThemeContext.Provider>;
}
