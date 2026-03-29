import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Modulo Comando / SOPs", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("lista SOPs com stats", async ({ page }) => {
    await page.goto("/comando");
    await expect(page.getByRole("heading", { name: "Comando" })).toBeVisible();
    await expect(page.getByText("SOPs total")).toBeVisible();
  });

  test("abre formulario de novo SOP", async ({ page }) => {
    await page.goto("/comando/sops/novo");
    await expect(page.getByRole("heading", { name: "Novo SOP" })).toBeVisible();
  });

  test("valida campos obrigatorios ao publicar", async ({ page }) => {
    await page.goto("/comando/sops/novo");
    await page.getByRole("button", { name: /publicar/i }).click();
    await expect(page.getByText("Preencha titulo")).toBeVisible();
  });
});
