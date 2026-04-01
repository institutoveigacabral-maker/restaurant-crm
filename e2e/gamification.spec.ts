import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Modulo Gamificacao", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("pagina gamification carrega", async ({ page }) => {
    await page.goto("/gamification");
    await expect(page.getByRole("heading", { name: /gamifica/i })).toBeVisible({ timeout: 5000 });
  });

  test("mostra perfil do usuario", async ({ page }) => {
    await page.goto("/gamification");
    await expect(page.getByText(/perfil|profile/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("mostra tabs ranking, conquistas e desafios", async ({ page }) => {
    await page.goto("/gamification");
    await expect(page.getByRole("tab", { name: /ranking/i })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByRole("tab", { name: /conquistas|badges/i })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByRole("tab", { name: /desafios|challenges/i })).toBeVisible({
      timeout: 5000,
    });
  });
});
