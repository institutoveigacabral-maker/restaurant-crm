import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Modulo Admin", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("pagina admin carrega", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /admin/i })).toBeVisible({ timeout: 5000 });
  });

  test("mostra stat cards globais", async ({ page }) => {
    await page.goto("/admin");
    const statCard = page.locator("[class*=card], [class*=stat]").first();
    await expect(statCard).toBeVisible({ timeout: 5000 });
  });

  test("mostra tabela de tenants", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("table").first()).toBeVisible({ timeout: 5000 });
  });

  test("mostra planos pricing", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText(/plano|pricing|plan/i).first()).toBeVisible({ timeout: 5000 });
  });
});
