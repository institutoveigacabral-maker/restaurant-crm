import { Page, expect } from "@playwright/test";

export async function login(page: Page) {
  await page.goto("/login");
  await page.getByPlaceholder("seu@email.com").fill("henrique@nexial.pt");
  await page.getByPlaceholder("••••••").fill("nexial2026");
  await page.getByRole("button", { name: /entrar/i }).click();

  // Wait for either redirect away from login or session to be established
  await Promise.race([
    page.waitForURL(/^(?!.*login)/, { timeout: 15000 }).catch(() => {}),
    page.waitForTimeout(3000),
  ]);

  // If still on login, navigate directly — session cookie should be set
  if (page.url().includes("/login")) {
    await page.goto("/");
  }

  // Verify we have a session
  await expect(page.locator("body")).not.toHaveText(/Entrar|Sign in/, { timeout: 5000 });
}
