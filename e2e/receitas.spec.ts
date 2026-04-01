import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Modulo Receitas", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("pagina receitas carrega", async ({ page }) => {
    await page.goto("/receitas");
    await expect(page.getByRole("heading", { name: /receitas|revenue/i })).toBeVisible({
      timeout: 5000,
    });
  });

  test("mostra programa de fidelidade ou CTA para criar", async ({ page }) => {
    await page.goto("/receitas");
    const hasProgram = await page
      .getByText(/fidelidade|loyalty/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasCTA = await page
      .getByRole("button", { name: /criar|create|novo/i })
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    expect(hasProgram || hasCTA).toBeTruthy();
  });

  test("se existir programa mostra ranking", async ({ page }) => {
    await page.goto("/receitas");
    const hasProgram = await page
      .getByText(/fidelidade|loyalty/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    if (hasProgram) {
      await expect(page.getByText(/ranking|top|pontos|points/i).first()).toBeVisible({
        timeout: 5000,
      });
    }
  });
});
