import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Dashboard Avancado", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("pagina dashboard carrega", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible({ timeout: 5000 });
  });

  test("mostra KPI cards", async ({ page }) => {
    await page.goto("/dashboard");
    const kpiCard = page.locator("[class*=card], [class*=kpi], [class*=stat]").first();
    await expect(kpiCard).toBeVisible({ timeout: 5000 });
  });

  test("mostra secao ROI ou empty state", async ({ page }) => {
    await page.goto("/dashboard");
    const hasROI = await page
      .getByText(/ROI/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/sem dados|nenhum|no data/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    expect(hasROI || hasEmpty).toBeTruthy();
  });

  test("mostra secao evolucao maturidade ou empty state", async ({ page }) => {
    await page.goto("/dashboard");
    const hasMaturity = await page
      .getByText(/maturidade|maturity|evolu[cç][aã]o/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/sem dados|nenhum|no data/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    expect(hasMaturity || hasEmpty).toBeTruthy();
  });
});
