import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Navegacao", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("sidebar mostra branding Nexial", async ({ page }) => {
    await expect(
      page.getByRole("complementary").getByRole("heading", { name: "Nexial Rede Neural" })
    ).toBeVisible();
  });

  test("navega para diagnostico via sidebar", async ({ page }) => {
    await page
      .getByRole("complementary")
      .getByRole("link", { name: "Diagnostico", exact: true })
      .click();
    await expect(page).toHaveURL(/\/diagnostico/);
  });

  test("navega para comando via sidebar", async ({ page }) => {
    await page
      .getByRole("complementary")
      .getByRole("link", { name: "Comando", exact: true })
      .click();
    await expect(page).toHaveURL(/\/comando/);
  });

  test("health endpoint retorna healthy", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe("healthy");
  });
});
