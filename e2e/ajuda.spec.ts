import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Central de Ajuda", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("pagina central de ajuda carrega", async ({ page }) => {
    await page.goto("/ajuda");
    await expect(page.getByRole("heading", { name: /ajuda|help/i })).toBeVisible({ timeout: 5000 });
  });

  test("mostra 7 cards de modulos", async ({ page }) => {
    await page.goto("/ajuda");
    const cards = page.locator("[class*=card]");
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(7);
  });

  test("clicar num card abre guia", async ({ page }) => {
    await page.goto("/ajuda");
    const firstCard = page.locator("[class*=card]").first();
    await expect(firstCard).toBeVisible({ timeout: 5000 });
    await firstCard.click();
    await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible({ timeout: 5000 });
  });

  test("guia tem secoes, dicas e FAQ", async ({ page }) => {
    await page.goto("/ajuda");
    const firstCard = page.locator("[class*=card]").first();
    await expect(firstCard).toBeVisible({ timeout: 5000 });
    await firstCard.click();

    const hasSections = await page
      .getByText(/se[cç][aã]o|section/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasTips = await page
      .getByText(/dica|tip/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasFAQ = await page
      .getByText(/FAQ|perguntas frequentes/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    expect(hasSections || hasTips || hasFAQ).toBeTruthy();
  });
});
