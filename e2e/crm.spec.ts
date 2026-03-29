import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Modulo CRM", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("pagina CRM carrega", async ({ page }) => {
    await page.goto("/crm");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("pagina clientes carrega", async ({ page }) => {
    await page.goto("/customers");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("pagina reservas carrega", async ({ page }) => {
    await page.goto("/reservations");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("pagina pedidos carrega", async ({ page }) => {
    await page.goto("/orders");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("pagina cardapio carrega", async ({ page }) => {
    await page.goto("/menu");
    await expect(page.getByRole("main")).toBeVisible();
  });
});
