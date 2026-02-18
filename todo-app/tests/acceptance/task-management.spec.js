import { test, expect } from '@playwright/test';

test.describe('Task Management - Acceptance Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('Morning routine: planning the day', async ({ page }) => {
        // User creates morning task list
        const morningTasks = [
            '☀️ Morning meditation',
            '💪 Workout',
            '📧 Check emails',
            '📅 Review calendar',
            '☕ Team standup'
        ];

        for (const task of morningTasks) {
            await page.fill('input.todo-input', task);
            await page.click('button:has-text("+ Add")');
        }

        // Verify all tasks added
        await expect(page.locator('.todo-item')).toHaveCount(5);

        // User starts completing tasks
        await page.locator('.todo-checkbox').first().click();
        await page.locator('.todo-checkbox').nth(1).click();

        // Check progress
        await expect(page.locator('.stat-item strong').nth(1)).toHaveText('2');
        await expect(page.locator('.stat-item strong').nth(2)).toHaveText('3');
    });

    test('Work session: focused task completion', async ({ page }) => {
        // User sets up work tasks
        await page.fill('input.todo-input', 'Review PR #456');
        await page.click('button:has-text("+ Add")');
        await page.fill('input.todo-input', 'Write documentation');
        await page.click('button:has-text("+ Add")');
        await page.fill('input.todo-input', 'Fix bug #789');
        await page.click('button:has-text("+ Add")');

        // User works through tasks systematically
        for (let i = 0; i < 3; i++) {
            // Complete task
            await page.locator('.todo-checkbox').first().click();

            // Verify completion
            await expect(page.locator('.todo-item.completed')).toHaveCount(i + 1);
        }

        // All tasks completed
        await expect(page.locator('.stat-item strong').nth(1)).toHaveText('3');
        await expect(page.locator('.stat-item strong').nth(2)).toHaveText('0');
    });

    test('Review session: editing and organizing tasks', async ({ page }) => {
        // User has existing tasks
        await page.fill('input.todo-input', 'Task 1');
        await page.click('button:has-text("+ Add")');
        await page.fill('input.todo-input', 'Task 2');
        await page.click('button:has-text("+ Add")');
        await page.fill('input.todo-input', 'Task 3');
        await page.click('button:has-text("+ Add")');

        // User reviews and updates task 1
        await page.locator('button.btn-edit').first().click();
        await page.fill('input.todo-input', 'Task 1 - Updated with details');
        await page.click('button:has-text("✓ Update")');

        // User completes task 2
        await page.locator('.todo-checkbox').nth(1).click();

        // User decides task 3 is no longer needed
        await page.locator('button.btn-delete').nth(2).click();

        // Verify final state
        await expect(page.locator('.todo-item')).toHaveCount(2);
        await expect(page.locator('.todo-text').first()).toHaveText('Task 1 - Updated with details');
    });

    test('Planning session: adding future tasks', async ({ page }) => {
        // User plans next week
        const nextWeekTasks = [
            'Monday: Team meeting',
            'Tuesday: Client presentation',
            'Wednesday: Code review',
            'Thursday: Deploy to production',
            'Friday: Sprint retrospective'
        ];

        for (const task of nextWeekTasks) {
            await page.fill('input.todo-input', task);
            await page.click('button:has-text("+ Add")');
        }

        // User adds some immediate tasks
        await page.fill('input.todo-input', 'TODAY: Urgent fix');
        await page.click('button:has-text("+ Add")');

        // User edits to prioritize
        await page.locator('button.btn-edit').nth(5).click();
        await page.fill('input.todo-input', '🔥 URGENT: Critical bug fix');
        await page.click('button:has-text("✓ Update")');

        // Verify all tasks present
        await expect(page.locator('.todo-item')).toHaveCount(6);
    });

    test('End of day: cleanup and preparation', async ({ page }) => {
        // User has mixed completed and active tasks
        const tasks = ['Morning task', 'Afternoon task', 'Evening task'];

        for (const task of tasks) {
            await page.fill('input.todo-input', task);
            await page.click('button:has-text("+ Add")');
        }

        // Complete first two
        await page.locator('.todo-checkbox').nth(0).click();
        await page.locator('.todo-checkbox').nth(1).click();

        // User removes completed tasks
        await page.locator('.todo-item.completed button.btn-delete').first().click();
        await page.locator('.todo-item.completed button.btn-delete').first().click();

        // Only active task remains
        await expect(page.locator('.todo-item')).toHaveCount(1);
        await expect(page.locator('.todo-text')).toHaveText('Evening task');

        // User adds tomorrow's tasks
        await page.fill('input.todo-input', 'Tomorrow: First thing');
        await page.click('button:has-text("+ Add")');

        await expect(page.locator('.todo-item')).toHaveCount(2);
    });

    test('Weekly review: managing large task list', async ({ page }) => {
        // User has accumulated many tasks
        for (let i = 1; i <= 15; i++) {
            await page.fill('input.todo-input', `Task ${i}`);
            await page.click('button:has-text("+ Add")');
        }

        // User completes half
        for (let i = 0; i < 7; i++) {
            await page.locator('.todo-checkbox').nth(i).click();
        }

        // User reviews statistics
        await expect(page.locator('.stat-item strong').first()).toHaveText('15');
        await expect(page.locator('.stat-item strong').nth(1)).toHaveText('7');
        await expect(page.locator('.stat-item strong').nth(2)).toHaveText('8');

        // User archives completed tasks
        const completedCount = await page.locator('.todo-item.completed').count();
        for (let i = 0; i < completedCount; i++) {
            await page.locator('.todo-item.completed button.btn-delete').first().click();
        }

        // Only active tasks remain
        await expect(page.locator('.todo-item')).toHaveCount(8);
        await expect(page.locator('.stat-item strong').nth(1)).toHaveText('0');
    });

    test('Interruption handling: adding urgent tasks mid-workflow', async ({ page }) => {
        // User is working on planned tasks
        await page.fill('input.todo-input', 'Planned task 1');
        await page.click('button:has-text("+ Add")');
        await page.fill('input.todo-input', 'Planned task 2');
        await page.click('button:has-text("+ Add")');

        // Urgent task comes in
        await page.fill('input.todo-input', '🚨 URGENT: Server down');
        await page.click('button:has-text("+ Add")');

        // User completes urgent task immediately
        await page.locator('.todo-item').filter({ hasText: 'URGENT' }).locator('.todo-checkbox').click();

        // User returns to planned tasks
        await page.locator('.todo-checkbox').first().click();

        // Verify workflow
        await expect(page.locator('.todo-item.completed')).toHaveCount(2);
        await expect(page.locator('.stat-item strong').nth(2)).toHaveText('1');
    });
});
