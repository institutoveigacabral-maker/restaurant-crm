import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByPlaceholder("seu@email.com")).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("seu@email.com").fill("wrong@email.com");
    await page.getByPlaceholder("••••••").fill("wrongpassword");
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page.getByText(/inválidos|erro|incorret/i)).toBeVisible({ timeout: 5000 });
  });

  test("successful login shows app content", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("seu@email.com").fill("henrique@nexial.pt");
    await page.getByPlaceholder("••••••").fill("nexial2026");
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("register page renders correctly", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByPlaceholder("Seu nome")).toBeVisible();
  });
});
