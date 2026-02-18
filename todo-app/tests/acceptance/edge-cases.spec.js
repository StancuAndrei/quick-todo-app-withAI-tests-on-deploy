import { test, expect } from '@playwright/test';

test.describe('Edge Cases and Error Handling - Acceptance Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test.describe('Input Validation', () => {
        test('should prevent empty task submission', async ({ page }) => {
            page.on('dialog', async dialog => {
                expect(dialog.message()).toBe('Please enter a task!');
                await dialog.accept();
            });

            await page.click('button:has-text("+ Add")');

            // No task should be added
            await expect(page.locator('.todo-item')).toHaveCount(0);
        });

        test('should prevent whitespace-only task submission', async ({ page }) => {
            page.on('dialog', async dialog => {
                expect(dialog.message()).toBe('Please enter a task!');
                await dialog.accept();
            });

            await page.fill('input.todo-input', '     ');
            await page.click('button:has-text("+ Add")');

            await expect(page.locator('.todo-item')).toHaveCount(0);
        });

        test('should handle very long task text', async ({ page }) => {
            const longText = 'A'.repeat(500);

            await page.fill('input.todo-input', longText);
            await page.click('button:has-text("+ Add")');

            await expect(page.locator('.todo-text')).toHaveText(longText);
        });

        test('should handle special characters in task text', async ({ page }) => {
            const specialText = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';

            await page.fill('input.todo-input', specialText);
            await page.click('button:has-text("+ Add")');

            await expect(page.locator('.todo-text')).toHaveText(specialText);
        });

        test('should handle unicode and emoji in task text', async ({ page }) => {
            const unicodeText = '你好 🎉 مرحبا 🚀 Привет 💯';

            await page.fill('input.todo-input', unicodeText);
            await page.click('button:has-text("+ Add")');

            await expect(page.locator('.todo-text')).toHaveText(unicodeText);
        });

        test('should handle HTML-like text without rendering', async ({ page }) => {
            const htmlText = '<script>alert("xss")</script>';

            await page.fill('input.todo-input', htmlText);
            await page.click('button:has-text("+ Add")');

            // Should display as text, not execute
            await expect(page.locator('.todo-text')).toHaveText(htmlText);
        });
    });

    test.describe('Rapid Consecutive Actions', () => {
        test('should handle rapid task additions', async ({ page }) => {
            // Add 10 tasks as fast as possible
            for (let i = 1; i <= 10; i++) {
                await page.fill('input.todo-input', `Rapid task ${i}`);
                await page.click('button:has-text("+ Add")');
            }

            await expect(page.locator('.todo-item')).toHaveCount(10);
        });

        test('should handle rapid toggle clicks', async ({ page }) => {
            await page.fill('input.todo-input', 'Toggle test');
            await page.click('button:has-text("+ Add")');

            const checkbox = page.locator('.todo-checkbox');

            // Rapid toggle
            for (let i = 0; i < 5; i++) {
                await checkbox.click();
            }

            // Should end up checked (odd number of clicks)
            await expect(checkbox).toBeChecked();
        });

        test('should handle rapid edit/cancel cycles', async ({ page }) => {
            await page.fill('input.todo-input', 'Edit test');
            await page.click('button:has-text("+ Add")');

            // Rapid edit/cancel
            for (let i = 0; i < 3; i++) {
                await page.click('button.btn-edit');
                await page.click('button:has-text("✕ Cancel")');
            }

            // Should still show original text
            await expect(page.locator('.todo-text')).toHaveText('Edit test');
        });

        test('should handle rapid delete clicks on different items', async ({ page }) => {
            // Add 5 tasks
            for (let i = 1; i <= 5; i++) {
                await page.fill('input.todo-input', `Task ${i}`);
                await page.click('button:has-text("+ Add")');
            }

            // Rapidly delete first 3
            for (let i = 0; i < 3; i++) {
                await page.locator('button.btn-delete').first().click();
            }

            await expect(page.locator('.todo-item')).toHaveCount(2);
        });
    });

    test.describe('Edit Mode Edge Cases', () => {
        test('should cancel edit without changes', async ({ page }) => {
            await page.fill('input.todo-input', 'Original text');
            await page.click('button:has-text("+ Add")');

            await page.click('button.btn-edit');
            await page.click('button:has-text("✕ Cancel")');

            await expect(page.locator('.todo-text')).toHaveText('Original text');
        });

        test('should handle deleting while in edit mode', async ({ page }) => {
            await page.fill('input.todo-input', 'Task 1');
            await page.click('button:has-text("+ Add")');
            await page.fill('input.todo-input', 'Task 2');
            await page.click('button:has-text("+ Add")');

            // Enter edit mode for task 1
            await page.locator('button.btn-edit').first().click();

            // Delete task 2
            await page.locator('button.btn-delete').nth(1).click();

            // Should still be in edit mode for task 1
            await expect(page.locator('button:has-text("✓ Update")')).toBeVisible();
            await expect(page.locator('.todo-item')).toHaveCount(1);
        });

        test('should handle empty edit submission', async ({ page }) => {
            page.on('dialog', async dialog => {
                expect(dialog.message()).toBe('Please enter a task!');
                await dialog.accept();
            });

            await page.fill('input.todo-input', 'Original');
            await page.click('button:has-text("+ Add")');

            await page.click('button.btn-edit');
            await page.fill('input.todo-input', '');
            await page.click('button:has-text("✓ Update")');

            // Should keep original text
            await expect(page.locator('.todo-text')).toHaveText('Original');
        });

        test('should update with same text (no actual change)', async ({ page }) => {
            await page.fill('input.todo-input', 'Same text');
            await page.click('button:has-text("+ Add")');

            await page.click('button.btn-edit');
            await page.click('button:has-text("✓ Update")');

            await expect(page.locator('.todo-text')).toHaveText('Same text');
            await expect(page.locator('button:has-text("+ Add")')).toBeVisible();
        });
    });

    test.describe('Delete Edge Cases', () => {
        test('should handle deleting last remaining todo', async ({ page }) => {
            await page.fill('input.todo-input', 'Last todo');
            await page.click('button:has-text("+ Add")');

            await page.click('button.btn-delete');

            await expect(page.locator('.empty-state')).toBeVisible();
            await expect(page.locator('.stat-item strong').first()).toHaveText('0');
        });

        test('should handle deleting completed todo', async ({ page }) => {
            await page.fill('input.todo-input', 'To complete and delete');
            await page.click('button:has-text("+ Add")');

            await page.click('.todo-checkbox');
            await page.click('button.btn-delete');

            await expect(page.locator('.empty-state')).toBeVisible();
        });

        test('should handle deleting while editing different todo', async ({ page }) => {
            await page.fill('input.todo-input', 'Task 1');
            await page.click('button:has-text("+ Add")');
            await page.fill('input.todo-input', 'Task 2');
            await page.click('button:has-text("+ Add")');

            await page.locator('button.btn-edit').first().click();
            await page.locator('button.btn-delete').nth(1).click();

            await expect(page.locator('.todo-item')).toHaveCount(1);
            await expect(page.locator('button:has-text("✓ Update")')).toBeVisible();
        });
    });

    test.describe('State Consistency', () => {
        test('should maintain state after multiple operations', async ({ page }) => {
            // Complex sequence
            await page.fill('input.todo-input', 'Task 1');
            await page.click('button:has-text("+ Add")');

            await page.click('.todo-checkbox');

            await page.fill('input.todo-input', 'Task 2');
            await page.click('button:has-text("+ Add")');

            await page.locator('button.btn-edit').first().click();
            await page.fill('input.todo-input', 'Task 1 Updated');
            await page.click('button:has-text("✓ Update")');

            await page.locator('button.btn-delete').nth(1).click();

            // Verify final state
            await expect(page.locator('.todo-item')).toHaveCount(1);
            await expect(page.locator('.todo-text')).toHaveText('Task 1 Updated');
            await expect(page.locator('.todo-checkbox')).toBeChecked();
        });

        test('should handle all operations on single todo', async ({ page }) => {
            // Add
            await page.fill('input.todo-input', 'Single task');
            await page.click('button:has-text("+ Add")');

            // Toggle
            await page.click('.todo-checkbox');
            await expect(page.locator('.todo-item')).toHaveClass(/completed/);

            // Untoggle
            await page.click('.todo-checkbox');
            await expect(page.locator('.todo-item')).not.toHaveClass(/completed/);

            // Edit
            await page.click('button.btn-edit');
            await page.fill('input.todo-input', 'Updated task');
            await page.click('button:has-text("✓ Update")');

            // Toggle again
            await page.click('.todo-checkbox');

            // Delete
            await page.click('button.btn-delete');

            await expect(page.locator('.empty-state')).toBeVisible();
        });
    });

    test.describe('Browser Edge Cases', () => {
        test('should handle page reload during edit', async ({ page }) => {
            await page.fill('input.todo-input', 'Task before reload');
            await page.click('button:has-text("+ Add")');

            await page.click('button.btn-edit');
            await page.fill('input.todo-input', 'Changed but not saved');

            await page.reload();

            // Should show original text
            await expect(page.locator('.todo-text')).toHaveText('Task before reload');
        });

        test('should handle corrupted localStorage gracefully', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.setItem('todos', '{invalid json}');
            });

            await page.reload();

            // Should show empty state, not crash
            await expect(page.locator('.empty-state')).toBeVisible();
        });

        test('should handle missing localStorage', async ({ page }) => {
            await page.evaluate(() => {
                localStorage.removeItem('todos');
            });

            await page.reload();

            await expect(page.locator('.empty-state')).toBeVisible();
        });
    });
});
