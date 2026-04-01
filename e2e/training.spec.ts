import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Modulo Formacao", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("pagina training carrega", async ({ page }) => {
    await page.goto("/training");
    await expect(page.getByRole("heading", { name: /forma[cç][aã]o|training/i })).toBeVisible({
      timeout: 5000,
    });
  });

  test("lista cursos ou empty state", async ({ page }) => {
    await page.goto("/training");
    const hasCourses = await page
      .getByText(/curso|course/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/nenhum|sem cursos|no courses|empty/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    expect(hasCourses || hasEmpty).toBeTruthy();
  });
});
