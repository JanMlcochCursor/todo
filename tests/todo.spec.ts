import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("adds, completes, and deletes a todo", async ({ page }) => {
  const input = page.getByPlaceholder("Add a new task...");

  await input.fill("Buy milk");
  await page.getByRole("button", { name: "Add" }).click();

  const todoItem = page.locator(".todo-item", { hasText: "Buy milk" });
  await expect(todoItem).toBeVisible();
  await expect(page.getByText("1 item left")).toBeVisible();

  await todoItem.getByRole("checkbox").check();
  await expect(page.getByText("0 items left")).toBeVisible();
  await expect(todoItem).toHaveClass(/completed/);

  await todoItem.getByRole("button", { name: /Delete/ }).click();
  await expect(page.locator(".todo-item")).toHaveCount(0);
  await expect(page.getByText("0 items left")).toBeVisible();
});

test("persists todos after reload", async ({ page }) => {
  const input = page.getByPlaceholder("Add a new task...");

  await input.fill("Write tests");
  await page.keyboard.press("Enter");

  await expect(page.locator(".todo-item", { hasText: "Write tests" })).toBeVisible();
  await page.reload();

  await expect(page.locator(".todo-item", { hasText: "Write tests" })).toBeVisible();
});

test("does not add empty or whitespace-only todos", async ({ page }) => {
  const input = page.getByPlaceholder("Add a new task...");
  const addButton = page.getByRole("button", { name: "Add" });

  await addButton.click();
  await expect(page.locator(".todo-item")).toHaveCount(0);
  await expect(page.getByText("0 items left")).toBeVisible();

  await input.fill("   ");
  await addButton.click();
  await expect(page.locator(".todo-item")).toHaveCount(0);
  await expect(page.getByText("0 items left")).toBeVisible();
});

test("updates counter when todo is completed and uncompleted", async ({ page }) => {
  const input = page.getByPlaceholder("Add a new task...");

  await input.fill("Task A");
  await page.keyboard.press("Enter");
  await input.fill("Task B");
  await page.keyboard.press("Enter");

  await expect(page.getByText("2 items left")).toBeVisible();

  const taskACheckbox = page
    .locator(".todo-item", { hasText: "Task A" })
    .getByRole("checkbox");
  await taskACheckbox.check();
  await expect(page.getByText("1 item left")).toBeVisible();

  await taskACheckbox.uncheck();
  await expect(page.getByText("2 items left")).toBeVisible();
});

test("clear completed removes only completed todos", async ({ page }) => {
  const input = page.getByPlaceholder("Add a new task...");

  await input.fill("Done task");
  await page.keyboard.press("Enter");
  await input.fill("Active task");
  await page.keyboard.press("Enter");

  const doneTask = page.locator(".todo-item", { hasText: "Done task" });
  const activeTask = page.locator(".todo-item", { hasText: "Active task" });

  await doneTask.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Clear completed" }).click();

  await expect(doneTask).toHaveCount(0);
  await expect(activeTask).toBeVisible();
  await expect(page.getByText("1 item left")).toBeVisible();
});

test("adds 100 todo items", async ({ page }) => {
  test.slow();
  const totalItems = 100;
  const input = page.getByPlaceholder("Add a new task...");

  for (let i = 1; i <= totalItems; i += 1) {
    await input.fill(`Task ${i}`);
    await page.keyboard.press("Enter");
  }

  await expect(page.locator(".todo-item")).toHaveCount(totalItems);
  await expect(page.getByText(`${totalItems} items left`)).toBeVisible();

  const list = page.locator("#todo-list");
  await list.evaluate((element) => {
    element.scrollTo({ top: element.scrollHeight, behavior: "auto" });
  });

  const isNearBottom = await list.evaluate((element) => {
    const threshold = 2;
    return element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;
  });
  expect(isNearBottom).toBe(true);
});
