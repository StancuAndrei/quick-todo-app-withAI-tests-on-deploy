import { test, expect } from '@playwright/test';

test.describe('LocalStorage Persistence - Functional Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test.describe('Saving to LocalStorage', () => {
        test('should save todos to localStorage when added', async ({ page }) => {
            await page.fill('input.todo-input', 'Persistent task');
            await page.click('button:has-text("+ Add")');

            const stored = await page.evaluate(() => localStorage.getItem('todos'));
            expect(stored).toBeTruthy();

            const todos = JSON.parse(stored);
            expect(todos).toHaveLength(1);
            expect(todos[0].text).toBe('Persistent task');
        });

        test('should save multiple todos', async ({ page }) => {
            await page.fill('input.todo-input', 'Task 1');
            await page.click('button:has-text("+ Add")');
            await page.fill('input.todo-input', 'Task 2');
            await page.click('button:has-text("+ Add")');

            const stored = await page.evaluate(() => localStorage.getItem('todos'));
            const todos = JSON.parse(stored);

            expect(todos).toHaveLength(2);
            expect(todos[0].text).toBe('Task 1');
            expect(todos[1].text).toBe('Task 2');
        });

        test('should update localStorage when todo is completed', async ({ page }) => {
            await page.fill('input.todo-input', 'Task');
            await page.click('button:has-text("+ Add")');

            await page.click('.todo-checkbox');

            const stored = await page.evaluate(() => localStorage.getItem('todos'));
            const todos = JSON.parse(stored);

            expect(todos[0].completed).toBe(true);
        });

        test('should update localStorage when todo is edited', async ({ page }) => {
            await page.fill('input.todo-input', 'Original');
            await page.click('button:has-text("+ Add")');

            await page.click('button.btn-edit');
            await page.fill('input.todo-input', 'Updated');
            await page.click('button:has-text("✓ Update")');

            const stored = await page.evaluate(() => localStorage.getItem('todos'));
            const todos = JSON.parse(stored);

            expect(todos[0].text).toBe('Updated');
        });

        test('should update localStorage when todo is deleted', async ({ page }) => {
            await page.fill('input.todo-input', 'Task 1');
            await page.click('button:has-text("+ Add")');
            await page.fill('input.todo-input', 'Task 2');
            await page.click('button:has-text("+ Add")');

            await page.locator('button.btn-delete').first().click();

            const stored = await page.evaluate(() => localStorage.getItem('todos'));
            const todos = JSON.parse(stored);

            expect(todos).toHaveLength(1);
            expect(todos[0].text).toBe('Task 2');
        });

        test('should save empty array when all todos deleted', async ({ page }) => {
            await page.fill('input.todo-input', 'Task');
            await page.click('button:has-text("+ Add")');

            await page.click('button.btn-delete');

            const stored = await page.evaluate(() => localStorage.getItem('todos'));
            const todos = JSON.parse(stored);

            expect(todos).toHaveLength(0);
        });
    });

    test.describe('Loading from LocalStorage', () => {
        test('should load todos from localStorage on mount', async ({ page }) => {
            const mockTodos = [
                { id: 1, text: 'Saved task 1', completed: false, createdAt: new Date().toISOString() },
                { id: 2, text: 'Saved task 2', completed: true, createdAt: new Date().toISOString() }
            ];

            await page.evaluate((todos) => {
                localStorage.setItem('todos', JSON.stringify(todos));
            }, mockTodos);

            await page.reload();

            await expect(page.locator('.todo-item')).toHaveCount(2);
            await expect(page.locator('.todo-text').first()).toHaveText('Saved task 1');
            await expect(page.locator('.todo-text').nth(1)).toHaveText('Saved task 2');
        });

        test('should restore completed state from localStorage', async ({ page }) => {
            const mockTodos = [
                { id: 1, text: 'Active task', completed: false, createdAt: new Date().toISOString() },
                { id: 2, text: 'Completed task', completed: true, createdAt: new Date().toISOString() }
            ];

            await page.evaluate((todos) => {
                localStorage.setItem('todos', JSON.stringify(todos));
            }, mockTodos);

            await page.reload();

            const checkboxes = page.locator('.todo-checkbox');
            await expect(checkboxes.first()).not.toBeChecked();
            await expect(checkboxes.nth(1)).toBeChecked();
        });

        test('should handle empty localStorage gracefully', async ({ page }) => {
            await page.evaluate(() => localStorage.clear());
            await page.reload();

            await expect(page.locator('.empty-state')).toBeVisible();
            await expect(page.locator('.todo-item')).toHaveCount(0);
        });

        test('should handle invalid localStorage data', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.setItem('todos', 'invalid json');
            });

            await page.reload();

            // Should not crash, should show empty state
            await expect(page.locator('.empty-state')).toBeVisible();
        });
    });

    test.describe('Persistence Across Page Reloads', () => {
        test('should persist todos after page reload', async ({ page }) => {
            await page.fill('input.todo-input', 'Persistent task');
            await page.click('button:has-text("+ Add")');

            await page.reload();

            await expect(page.locator('.todo-text')).toHaveText('Persistent task');
        });

        test('should persist completed state after reload', async ({ page }) => {
            await page.fill('input.todo-input', 'Task');
            await page.click('button:has-text("+ Add")');
            await page.click('.todo-checkbox');

            await page.reload();

            await expect(page.locator('.todo-checkbox')).toBeChecked();
            await expect(page.locator('.todo-item')).toHaveClass(/completed/);
        });

        test('should persist multiple operations across reload', async ({ page }) => {
            // Add 3 tasks
            await page.fill('input.todo-input', 'Task 1');
            await page.click('button:has-text("+ Add")');
            await page.fill('input.todo-input', 'Task 2');
            await page.click('button:has-text("+ Add")');
            await page.fill('input.todo-input', 'Task 3');
            await page.click('button:has-text("+ Add")');

            // Complete one
            await page.locator('.todo-checkbox').nth(1).click();

            // Delete one
            await page.locator('button.btn-delete').first().click();

            await page.reload();

            await expect(page.locator('.todo-item')).toHaveCount(2);
            await expect(page.locator('.todo-text').first()).toHaveText('Task 2');
            await expect(page.locator('.todo-checkbox').first()).toBeChecked();
        });

        test('should maintain statistics after reload', async ({ page }) => {
            await page.fill('input.todo-input', 'Task 1');
            await page.click('button:has-text("+ Add")');
            await page.fill('input.todo-input', 'Task 2');
            await page.click('button:has-text("+ Add")');
            await page.locator('.todo-checkbox').first().click();

            await page.reload();

            await expect(page.locator('.stat-item strong').first()).toHaveText('2'); // Total
            await expect(page.locator('.stat-item strong').nth(1)).toHaveText('1'); // Completed
            await expect(page.locator('.stat-item strong').nth(2)).toHaveText('1'); // Active
        });
    });

    test.describe('Data Integrity', () => {
        test('should preserve todo IDs across operations', async ({ page }) => {
            await page.fill('input.todo-input', 'Task 1');
            await page.click('button:has-text("+ Add")');

            const stored1 = await page.evaluate(() => localStorage.getItem('todos'));
            const todos1 = JSON.parse(stored1);
            const originalId = todos1[0].id;

            await page.click('.todo-checkbox');

            const stored2 = await page.evaluate(() => localStorage.getItem('todos'));
            const todos2 = JSON.parse(stored2);

            expect(todos2[0].id).toBe(originalId);
        });

        test('should preserve createdAt timestamp', async ({ page }) => {
            await page.fill('input.todo-input', 'Task');
            await page.click('button:has-text("+ Add")');

            const stored = await page.evaluate(() => localStorage.getItem('todos'));
            const todos = JSON.parse(stored);

            expect(todos[0].createdAt).toBeTruthy();
            expect(new Date(todos[0].createdAt).getTime()).toBeLessThanOrEqual(Date.now());
        });

        test('should maintain correct data structure', async ({ page }) => {
            await page.fill('input.todo-input', 'Test task');
            await page.click('button:has-text("+ Add")');

            const stored = await page.evaluate(() => localStorage.getItem('todos'));
            const todos = JSON.parse(stored);

            expect(todos[0]).toHaveProperty('id');
            expect(todos[0]).toHaveProperty('text');
            expect(todos[0]).toHaveProperty('completed');
            expect(todos[0]).toHaveProperty('createdAt');
        });
    });
});
