import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Modulo Automacoes", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("pagina automacoes carrega", async ({ page }) => {
    await page.goto("/automacoes");
    await expect(page.getByRole("heading", { name: /automa[cç][oõ]es|automations/i })).toBeVisible({
      timeout: 5000,
    });
  });

  test("lista automacoes ou empty state", async ({ page }) => {
    await page.goto("/automacoes");
    const hasAutomations = await page
      .getByText(/automa[cç][aã]o|automation|fluxo|flow/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/nenhuma|sem automa|no automations|empty/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    expect(hasAutomations || hasEmpty).toBeTruthy();
  });
});
