import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Modulo Diagnostico", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("lista diagnosticos", async ({ page }) => {
    await page.goto("/diagnostico");
    await expect(page.getByRole("heading", { name: "Diagnostico" })).toBeVisible();
  });

  test("abre wizard de novo diagnostico", async ({ page }) => {
    await page.goto("/diagnostico/novo");
    await expect(page.getByRole("heading", { name: "Novo Diagnostico" })).toBeVisible();
  });

  test("preenche titulo e avanca para secao 1", async ({ page }) => {
    await page.goto("/diagnostico/novo");
    await page.getByPlaceholder(/Diagnostico inicial/i).fill("Teste E2E");
    await page.getByRole("button", { name: /iniciar anamnese/i }).click();
    await expect(page.getByText("Ferramentas Digitais")).toBeVisible();
  });

  test("pagina de detalhe carrega para diagnostico existente", async ({ page }) => {
    await page.goto("/diagnostico");
    const verButton = page.getByRole("link", { name: /ver/i }).first();
    if (await verButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await verButton.click();
      await expect(page.getByText("Score de Maturidade")).toBeVisible({ timeout: 5000 });
    }
  });
});
