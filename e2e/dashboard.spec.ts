import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByPlaceholder("seu@email.com").fill("admin@restaurante.com");
  await page.getByPlaceholder("••••••").fill("admin123");
  await page.getByRole("button", { name: /entrar/i }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
    timeout: 15000,
  });
}

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("displays stat cards", async ({ page }) => {
    await expect(page.getByText("Clientes").first()).toBeVisible();
    await expect(page.getByText("Receita").first()).toBeVisible();
    await expect(page.getByText("Ticket Médio")).toBeVisible();
  });

  test("displays top customers chart", async ({ page }) => {
    await expect(page.getByText("Top Clientes por Gasto")).toBeVisible();
  });

  test("displays charts section", async ({ page }) => {
    await expect(page.getByText("Pedidos por Status")).toBeVisible();
  });

  test("sidebar navigation works", async ({ page }) => {
    await page.getByRole("link", { name: "Clientes" }).click();
    await expect(page.getByRole("heading", { name: "Clientes" })).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole("link", { name: "Reservas" }).click();
    await expect(page.getByRole("heading", { name: "Reservas" })).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole("link", { name: "Pedidos" }).click();
    await expect(page.getByRole("heading", { name: "Pedidos" })).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("Customers Page", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Clientes" }).click();
    await expect(page.getByRole("heading", { name: "Clientes" })).toBeVisible({
      timeout: 10000,
    });
  });

  test("displays customer cards", async ({ page }) => {
    await expect(page.getByText("Maria Silva")).toBeVisible({ timeout: 10000 });
  });

  test("search filters customers", async ({ page }) => {
    await expect(page.getByText("Maria Silva")).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder(/buscar/i).fill("Ana");
    await expect(page.getByText("Ana Oliveira")).toBeVisible();
    await expect(page.getByText("Maria Silva")).not.toBeVisible();
  });

  test("opens new customer modal", async ({ page }) => {
    await page.getByRole("button", { name: /novo cliente/i }).click();
    await expect(page.getByRole("heading", { name: "Novo Cliente" })).toBeVisible();
  });
});
