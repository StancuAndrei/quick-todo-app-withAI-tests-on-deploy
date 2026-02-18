import { test, expect } from '@playwright/test';

test.describe('CRUD Operations - Functional Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Clear localStorage before each test
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test.describe('CREATE Operations', () => {
        test('should add a single todo', async ({ page }) => {
            await page.fill('input.todo-input', 'Buy groceries');
            await page.click('button:has-text("+ Add")');

            await expect(page.locator('.todo-item')).toHaveCount(1);
            await expect(page.locator('.todo-text')).toHaveText('Buy groceries');
        });

        test('should add multiple todos', async ({ page }) => {
            const tasks = ['Task 1', 'Task 2', 'Task 3'];

            for (const task of tasks) {
                await page.fill('input.todo-input', task);
                await page.click('button:has-text("+ Add")');
            }

            await expect(page.locator('.todo-item')).toHaveCount(3);

            for (let i = 0; i < tasks.length; i++) {
                await expect(page.locator('.todo-text').nth(i)).toHaveText(tasks[i]);
            }
        });

        test('should clear input after adding todo', async ({ page }) => {
            await page.fill('input.todo-input', 'New task');
            await page.click('button:has-text("+ Add")');

            const inputValue = await page.inputValue('input.todo-input');
            expect(inputValue).toBe('');
        });

        test('should show alert on empty task submission', async ({ page }) => {
            page.on('dialog', async dialog => {
                expect(dialog.message()).toBe('Please enter a task!');
                await dialog.accept();
            });

            await page.click('button:has-text("+ Add")');
        });

        test('should trim whitespace from task text', async ({ page }) => {
            await page.fill('input.todo-input', '  Trimmed task  ');
            await page.click('button:has-text("+ Add")');

            await expect(page.locator('.todo-text')).toHaveText('Trimmed task');
        });
    });

    test.describe('READ Operations', () => {
        test('should display all todos correctly', async ({ page }) => {
            const tasks = ['First', 'Second', 'Third'];

            for (const task of tasks) {
                await page.fill('input.todo-input', task);
                await page.click('button:has-text("+ Add")');
            }

            const todoItems = page.locator('.todo-item');
            await expect(todoItems).toHaveCount(3);

            for (const task of tasks) {
                await expect(page.locator('.todo-text', { hasText: task })).toBeVisible();
            }
        });

        test('should show empty state when no todos', async ({ page }) => {
            await expect(page.locator('.empty-state')).toBeVisible();
            await expect(page.locator('.empty-state p')).toHaveText('🎉 No tasks yet! Add one above to get started.');
        });

        test('should hide empty state when todos exist', async ({ page }) => {
            await page.fill('input.todo-input', 'First task');
            await page.click('button:has-text("+ Add")');

            await expect(page.locator('.empty-state')).not.toBeVisible();
        });
    });

    test.describe('UPDATE Operations', () => {
        test('should toggle todo completion', async ({ page }) => {
            await page.fill('input.todo-input', 'Task to complete');
            await page.click('button:has-text("+ Add")');

            const checkbox = page.locator('.todo-checkbox');
            await expect(checkbox).not.toBeChecked();

            await checkbox.click();
            await expect(checkbox).toBeChecked();
            await expect(page.locator('.todo-item')).toHaveClass(/completed/);

            await checkbox.click();
            await expect(checkbox).not.toBeChecked();
            await expect(page.locator('.todo-item')).not.toHaveClass(/completed/);
        });

        test('should edit todo text', async ({ page }) => {
            await page.fill('input.todo-input', 'Original text');
            await page.click('button:has-text("+ Add")');

            await page.click('button.btn-edit');

            await expect(page.locator('input.todo-input')).toHaveValue('Original text');
            await expect(page.locator('button:has-text("✓ Update")')).toBeVisible();

            await page.fill('input.todo-input', 'Updated text');
            await page.click('button:has-text("✓ Update")');

            await expect(page.locator('.todo-text')).toHaveText('Updated text');
            await expect(page.locator('button:has-text("+ Add")')).toBeVisible();
        });

        test('should cancel edit mode', async ({ page }) => {
            await page.fill('input.todo-input', 'Task to edit');
            await page.click('button:has-text("+ Add")');

            await page.click('button.btn-edit');
            await page.fill('input.todo-input', 'Changed text');
            await page.click('button:has-text("✕ Cancel")');

            await expect(page.locator('.todo-text')).toHaveText('Task to edit');
            await expect(page.locator('button:has-text("+ Add")')).toBeVisible();
        });

        test('should update multiple todos independently', async ({ page }) => {
            await page.fill('input.todo-input', 'First task');
            await page.click('button:has-text("+ Add")');
            await page.fill('input.todo-input', 'Second task');
            await page.click('button:has-text("+ Add")');

            // Edit first todo
            await page.locator('button.btn-edit').first().click();
            await page.fill('input.todo-input', 'First updated');
            await page.click('button:has-text("✓ Update")');

            await expect(page.locator('.todo-text').first()).toHaveText('First updated');
            await expect(page.locator('.todo-text').nth(1)).toHaveText('Second task');
        });
    });

    test.describe('DELETE Operations', () => {
        test('should delete a single todo', async ({ page }) => {
            await page.fill('input.todo-input', 'Task to delete');
            await page.click('button:has-text("+ Add")');

            await expect(page.locator('.todo-item')).toHaveCount(1);

            await page.click('button.btn-delete');

            await expect(page.locator('.todo-item')).toHaveCount(0);
            await expect(page.locator('.empty-state')).toBeVisible();
        });

        test('should delete specific todo from list', async ({ page }) => {
            const tasks = ['Task 1', 'Task 2', 'Task 3'];

            for (const task of tasks) {
                await page.fill('input.todo-input', task);
                await page.click('button:has-text("+ Add")');
            }

            // Delete second task
            await page.locator('button.btn-delete').nth(1).click();

            await expect(page.locator('.todo-item')).toHaveCount(2);
            await expect(page.locator('.todo-text').first()).toHaveText('Task 1');
            await expect(page.locator('.todo-text').nth(1)).toHaveText('Task 3');
        });

        test('should delete all todos one by one', async ({ page }) => {
            const tasks = ['Task 1', 'Task 2', 'Task 3'];

            for (const task of tasks) {
                await page.fill('input.todo-input', task);
                await page.click('button:has-text("+ Add")');
            }

            for (let i = tasks.length; i > 0; i--) {
                await page.locator('button.btn-delete').first().click();
                await expect(page.locator('.todo-item')).toHaveCount(i - 1);
            }

            await expect(page.locator('.empty-state')).toBeVisible();
        });
    });

    test.describe('Bulk Operations', () => {
        test('should handle rapid consecutive additions', async ({ page }) => {
            const tasks = Array.from({ length: 10 }, (_, i) => `Task ${i + 1}`);

            for (const task of tasks) {
                await page.fill('input.todo-input', task);
                await page.click('button:has-text("+ Add")');
            }

            await expect(page.locator('.todo-item')).toHaveCount(10);
        });

        test('should complete multiple todos', async ({ page }) => {
            await page.fill('input.todo-input', 'Task 1');
            await page.click('button:has-text("+ Add")');
            await page.fill('input.todo-input', 'Task 2');
            await page.click('button:has-text("+ Add")');
            await page.fill('input.todo-input', 'Task 3');
            await page.click('button:has-text("+ Add")');

            const checkboxes = page.locator('.todo-checkbox');
            await checkboxes.nth(0).click();
            await checkboxes.nth(2).click();

            await expect(page.locator('.todo-item.completed')).toHaveCount(2);
        });

        test('should add, edit, complete, and delete in sequence', async ({ page }) => {
            // Add
            await page.fill('input.todo-input', 'Sequential task');
            await page.click('button:has-text("+ Add")');

            // Edit
            await page.click('button.btn-edit');
            await page.fill('input.todo-input', 'Updated sequential task');
            await page.click('button:has-text("✓ Update")');

            // Complete
            await page.click('.todo-checkbox');
            await expect(page.locator('.todo-item')).toHaveClass(/completed/);

            // Delete
            await page.click('button.btn-delete');
            await expect(page.locator('.empty-state')).toBeVisible();
        });
    });
});
