import { test, expect } from '@playwright/test';

test.describe('State Management - Functional Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test.describe('Statistics Updates', () => {
        test('should show correct total count', async ({ page }) => {
            await expect(page.locator('.stat-item strong').first()).toHaveText('0');

            await page.fill('input.todo-input', 'Task 1');
            await page.click('button:has-text("+ Add")');

            await expect(page.locator('.stat-item strong').first()).toHaveText('1');

            await page.fill('input.todo-input', 'Task 2');
            await page.click('button:has-text("+ Add")');

            await expect(page.locator('.stat-item strong').first()).toHaveText('2');
        });

        test('should update completed count when toggling', async ({ page }) => {
            await page.fill('input.todo-input', 'Task 1');
            await page.click('button:has-text("+ Add")');
            await page.fill('input.todo-input', 'Task 2');
            await page.click('button:has-text("+ Add")');

            await expect(page.locator('.stat-item strong').nth(1)).toHaveText('0');

            await page.locator('.todo-checkbox').first().click();
            await expect(page.locator('.stat-item strong').nth(1)).toHaveText('1');

            await page.locator('.todo-checkbox').nth(1).click();
            await expect(page.locator('.stat-item strong').nth(1)).toHaveText('2');
        });

        test('should update active count correctly', async ({ page }) => {
            await page.fill('input.todo-input', 'Task 1');
            await page.click('button:has-text("+ Add")');
            await page.fill('input.todo-input', 'Task 2');
            await page.click('button:has-text("+ Add")');
            await page.fill('input.todo-input', 'Task 3');
            await page.click('button:has-text("+ Add")');

            await expect(page.locator('.stat-item strong').nth(2)).toHaveText('3');

            await page.locator('.todo-checkbox').first().click();
            await expect(page.locator('.stat-item strong').nth(2)).toHaveText('2');

            await page.locator('.todo-checkbox').nth(1).click();
            await expect(page.locator('.stat-item strong').nth(2)).toHaveText('1');
        });

        test('should update statistics when deleting', async ({ page }) => {
            await page.fill('input.todo-input', 'Task 1');
            await page.click('button:has-text("+ Add")');
            await page.fill('input.todo-input', 'Task 2');
            await page.click('button:has-text("+ Add")');

            await expect(page.locator('.stat-item strong').first()).toHaveText('2');

            await page.locator('button.btn-delete').first().click();

            await expect(page.locator('.stat-item strong').first()).toHaveText('1');
        });

        test('should maintain correct stats after complex operations', async ({ page }) => {
            // Add 5 tasks
            for (let i = 1; i <= 5; i++) {
                await page.fill('input.todo-input', `Task ${i}`);
                await page.click('button:has-text("+ Add")');
            }

            // Complete 3 tasks
            await page.locator('.todo-checkbox').nth(0).click();
            await page.locator('.todo-checkbox').nth(2).click();
            await page.locator('.todo-checkbox').nth(4).click();

            // Delete 1 completed task
            await page.locator('.todo-item.completed button.btn-delete').first().click();

            // Verify stats: 4 total, 2 completed, 2 active
            await expect(page.locator('.stat-item strong').first()).toHaveText('4');
            await expect(page.locator('.stat-item strong').nth(1)).toHaveText('2');
            await expect(page.locator('.stat-item strong').nth(2)).toHaveText('2');
        });
    });

    test.describe('Edit Mode State', () => {
        test('should enter and exit edit mode correctly', async ({ page }) => {
            await page.fill('input.todo-input', 'Task to edit');
            await page.click('button:has-text("+ Add")');

            // Enter edit mode
            await page.click('button.btn-edit');
            await expect(page.locator('button:has-text("✓ Update")')).toBeVisible();
            await expect(page.locator('button:has-text("✕ Cancel")')).toBeVisible();
            await expect(page.locator('button:has-text("+ Add")')).not.toBeVisible();

            // Exit edit mode
            await page.click('button:has-text("✕ Cancel")');
            await expect(page.locator('button:has-text("+ Add")')).toBeVisible();
            await expect(page.locator('button:has-text("✓ Update")')).not.toBeVisible();
        });

        test('should clear edit mode after successful update', async ({ page }) => {
            await page.fill('input.todo-input', 'Original');
            await page.click('button:has-text("+ Add")');

            await page.click('button.btn-edit');
            await page.fill('input.todo-input', 'Updated');
            await page.click('button:has-text("✓ Update")');

            await expect(page.locator('button:has-text("+ Add")')).toBeVisible();
            await expect(page.locator('input.todo-input')).toHaveValue('');
        });

        test('should only allow editing one todo at a time', async ({ page }) => {
            await page.fill('input.todo-input', 'Task 1');
            await page.click('button:has-text("+ Add")');
            await page.fill('input.todo-input', 'Task 2');
            await page.click('button:has-text("+ Add")');

            await page.locator('button.btn-edit').first().click();
            await expect(page.locator('input.todo-input')).toHaveValue('Task 1');

            // Form should be in edit mode, not add mode
            await expect(page.locator('button:has-text("✓ Update")')).toBeVisible();
        });
    });

    test.describe('Form State Management', () => {
        test('should clear form after adding todo', async ({ page }) => {
            await page.fill('input.todo-input', 'New task');
            await page.click('button:has-text("+ Add")');

            await expect(page.locator('input.todo-input')).toHaveValue('');
        });

        test('should maintain input focus after operations', async ({ page }) => {
            await page.fill('input.todo-input', 'Task');
            await page.click('button:has-text("+ Add")');

            const input = page.locator('input.todo-input');
            await expect(input).toBeFocused();
        });

        test('should handle rapid state changes', async ({ page }) => {
            // Add task
            await page.fill('input.todo-input', 'Task');
            await page.click('button:has-text("+ Add")');

            // Immediately enter edit
            await page.click('button.btn-edit');

            // Immediately cancel
            await page.click('button:has-text("✕ Cancel")');

            // Immediately add another
            await page.fill('input.todo-input', 'Another task');
            await page.click('button:has-text("+ Add")');

            await expect(page.locator('.todo-item')).toHaveCount(2);
        });
    });

    test.describe('Visual State Updates', () => {
        test('should apply completed class when toggled', async ({ page }) => {
            await page.fill('input.todo-input', 'Task');
            await page.click('button:has-text("+ Add")');

            const todoItem = page.locator('.todo-item');
            await expect(todoItem).not.toHaveClass(/completed/);

            await page.click('.todo-checkbox');
            await expect(todoItem).toHaveClass(/completed/);
        });

        test('should remove completed class when untoggled', async ({ page }) => {
            await page.fill('input.todo-input', 'Task');
            await page.click('button:has-text("+ Add")');

            await page.click('.todo-checkbox');
            await page.click('.todo-checkbox');

            await expect(page.locator('.todo-item')).not.toHaveClass(/completed/);
        });

        test('should show/hide empty state based on todo count', async ({ page }) => {
            await expect(page.locator('.empty-state')).toBeVisible();

            await page.fill('input.todo-input', 'Task');
            await page.click('button:has-text("+ Add")');

            await expect(page.locator('.empty-state')).not.toBeVisible();

            await page.click('button.btn-delete');

            await expect(page.locator('.empty-state')).toBeVisible();
        });
    });
});
