import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("hides completed todos when Hide done is clicked", async ({ page }) => {
  const input = page.getByPlaceholder("Add a new task...");

  await input.fill("Active task");
  await page.keyboard.press("Enter");
  await input.fill("Done task");
  await page.keyboard.press("Enter");

  await page.locator(".todo-item", { hasText: "Done task" }).getByRole("checkbox").check();

  await page.getByRole("button", { name: "Hide done" }).click();

  await expect(page.locator(".todo-item", { hasText: "Done task" })).toHaveCount(0);
  await expect(page.locator(".todo-item", { hasText: "Active task" })).toBeVisible();
});

test("shows completed todos again when Show done is clicked", async ({ page }) => {
  const input = page.getByPlaceholder("Add a new task...");

  await input.fill("Done task");
  await page.keyboard.press("Enter");

  await page.locator(".todo-item", { hasText: "Done task" }).getByRole("checkbox").check();

  await page.getByRole("button", { name: "Hide done" }).click();
  await expect(page.locator(".todo-item", { hasText: "Done task" })).toHaveCount(0);

  await page.getByRole("button", { name: "Show done" }).click();
  await expect(page.locator(".todo-item", { hasText: "Done task" })).toBeVisible();
});

test("button label toggles between Hide done and Show done", async ({ page }) => {
  const toggleButton = page.getByRole("button", { name: /Hide done|Show done/ });

  await expect(toggleButton).toHaveText("Hide done");
  await toggleButton.click();
  await expect(toggleButton).toHaveText("Show done");
  await toggleButton.click();
  await expect(toggleButton).toHaveText("Hide done");
});

test("hide done does not affect the items left counter", async ({ page }) => {
  const input = page.getByPlaceholder("Add a new task...");

  await input.fill("Active task");
  await page.keyboard.press("Enter");
  await input.fill("Done task");
  await page.keyboard.press("Enter");

  await page.locator(".todo-item", { hasText: "Done task" }).getByRole("checkbox").check();
  await expect(page.getByText("1 item left")).toBeVisible();

  await page.getByRole("button", { name: "Hide done" }).click();
  await expect(page.getByText("1 item left")).toBeVisible();
});
