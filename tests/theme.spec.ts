import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("defaults to system preference when no theme is stored", async ({ page }) => {
  const theme = await page.evaluate(() => document.body.dataset.theme);
  expect(["light", "dark"]).toContain(theme);
});

test("toggles from light to dark mode", async ({ page }) => {
  await page.evaluate(() => localStorage.setItem("todo-theme", "light"));
  await page.reload();

  await expect(page.locator("body")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Dark mode" }).click();
  await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");
});

test("toggles from dark to light mode", async ({ page }) => {
  await page.evaluate(() => localStorage.setItem("todo-theme", "dark"));
  await page.reload();

  await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Light mode" }).click();
  await expect(page.locator("body")).toHaveAttribute("data-theme", "light");
});

test("persists theme selection after reload", async ({ page }) => {
  await page.evaluate(() => localStorage.setItem("todo-theme", "light"));
  await page.reload();

  await page.getByRole("button", { name: "Dark mode" }).click();
  await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");
});

test("button label reflects current theme", async ({ page }) => {
  await page.evaluate(() => localStorage.setItem("todo-theme", "light"));
  await page.reload();

  const toggleButton = page.getByRole("button", { name: /Light mode|Dark mode/ });
  await expect(toggleButton).toHaveText("Dark mode");

  await toggleButton.click();
  await expect(toggleButton).toHaveText("Light mode");
});
