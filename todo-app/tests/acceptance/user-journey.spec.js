import { test, expect } from '@playwright/test';

test.describe('User Journey - Acceptance Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('First-time user: discovers app and adds first todo', async ({ page }) => {
        // User lands on empty app
        await expect(page.locator('h1')).toHaveText('📝 TODO App');
        await expect(page.locator('.empty-state')).toBeVisible();
        await expect(page.locator('.empty-state p')).toContainText('No tasks yet');

        // User sees the input field and understands what to do
        const input = page.locator('input.todo-input');
        await expect(input).toHaveAttribute('placeholder', 'Add a new task...');

        // User adds their first task
        await input.fill('Buy groceries');
        await page.click('button:has-text("+ Add")');

        // User sees their task appear
        await expect(page.locator('.todo-text')).toHaveText('Buy groceries');
        await expect(page.locator('.empty-state')).not.toBeVisible();

        // User sees statistics update
        await expect(page.locator('.stat-item strong').first()).toHaveText('1');
    });

    test('Returning user: sees saved todos and continues work', async ({ page }) => {
        // Setup: User has existing todos from previous session
        const existingTodos = [
            { id: 1, text: 'Morning exercise', completed: true, createdAt: new Date().toISOString() },
            { id: 2, text: 'Check emails', completed: false, createdAt: new Date().toISOString() },
            { id: 3, text: 'Team meeting', completed: false, createdAt: new Date().toISOString() }
        ];

        await page.evaluate((todos) => {
            localStorage.setItem('todos', JSON.stringify(todos));
        }, existingTodos);

        await page.reload();

        // User sees their previous todos
        await expect(page.locator('.todo-item')).toHaveCount(3);
        await expect(page.locator('.todo-item.completed')).toHaveCount(1);

        // User completes a task
        await page.locator('.todo-item:not(.completed) .todo-checkbox').first().click();
        await expect(page.locator('.todo-item.completed')).toHaveCount(2);

        // User adds a new task
        await page.fill('input.todo-input', 'Prepare presentation');
        await page.click('button:has-text("+ Add")');

        await expect(page.locator('.todo-item')).toHaveCount(4);
    });

    test('Power user: manages 10+ todos efficiently', async ({ page }) => {
        // User adds multiple tasks quickly
        const tasks = [
            'Review pull requests',
            'Update documentation',
            'Fix bug #123',
            'Write unit tests',
            'Code review meeting',
            'Lunch break',
            'Client call',
            'Update project board',
            'Send weekly report',
            'Plan sprint',
            'Team standup',
            'Deploy to staging'
        ];

        for (const task of tasks) {
            await page.fill('input.todo-input', task);
            await page.click('button:has-text("+ Add")');
        }

        // User sees all tasks
        await expect(page.locator('.todo-item')).toHaveCount(12);

        // User completes several tasks
        for (let i = 0; i < 5; i++) {
            await page.locator('.todo-checkbox').nth(i).click();
        }

        // User checks statistics
        await expect(page.locator('.stat-item strong').first()).toHaveText('12'); // Total
        await expect(page.locator('.stat-item strong').nth(1)).toHaveText('5'); // Completed
        await expect(page.locator('.stat-item strong').nth(2)).toHaveText('7'); // Active

        // User deletes completed tasks
        const completedItems = page.locator('.todo-item.completed');
        const count = await completedItems.count();

        for (let i = 0; i < count; i++) {
            await page.locator('.todo-item.completed button.btn-delete').first().click();
        }

        await expect(page.locator('.todo-item')).toHaveCount(7);
    });

    test('Completion workflow: adds tasks, completes them, reviews stats', async ({ page }) => {
        // Morning: User plans their day
        const morningTasks = [
            'Morning workout',
            'Breakfast',
            'Check emails',
            'Team standup'
        ];

        for (const task of morningTasks) {
            await page.fill('input.todo-input', task);
            await page.click('button:has-text("+ Add")');
        }

        // User completes morning tasks one by one
        await page.locator('.todo-checkbox').nth(0).click();
        await expect(page.locator('.stat-item strong').nth(1)).toHaveText('1');

        await page.locator('.todo-checkbox').nth(1).click();
        await expect(page.locator('.stat-item strong').nth(1)).toHaveText('2');

        // User adds afternoon tasks
        await page.fill('input.todo-input', 'Project work');
        await page.click('button:has-text("+ Add")');
        await page.fill('input.todo-input', 'Code review');
        await page.click('button:has-text("+ Add")');

        // User reviews progress
        await expect(page.locator('.stat-item strong').first()).toHaveText('6'); // Total
        await expect(page.locator('.stat-item strong').nth(1)).toHaveText('2'); // Completed
        await expect(page.locator('.stat-item strong').nth(2)).toHaveText('4'); // Active

        // End of day: User completes remaining tasks
        const checkboxes = page.locator('.todo-checkbox:not(:checked)');
        const remainingCount = await checkboxes.count();

        for (let i = 0; i < remainingCount; i++) {
            await page.locator('.todo-checkbox:not(:checked)').first().click();
        }

        // User sees all tasks completed
        await expect(page.locator('.stat-item strong').nth(1)).toHaveText('6');
        await expect(page.locator('.stat-item strong').nth(2)).toHaveText('0');
    });

    test('Edit workflow: user corrects mistakes and updates tasks', async ({ page }) => {
        // User adds task with typo
        await page.fill('input.todo-input', 'Buy groseries');
        await page.click('button:has-text("+ Add")');

        // User notices typo and edits
        await page.click('button.btn-edit');
        await expect(page.locator('input.todo-input')).toHaveValue('Buy groseries');

        await page.fill('input.todo-input', 'Buy groceries');
        await page.click('button:has-text("✓ Update")');

        await expect(page.locator('.todo-text')).toHaveText('Buy groceries');

        // User adds another task
        await page.fill('input.todo-input', 'Call dentist');
        await page.click('button:has-text("+ Add")');

        // User realizes they need to be more specific
        await page.locator('button.btn-edit').nth(1).click();
        await page.fill('input.todo-input', 'Call dentist to schedule appointment');
        await page.click('button:has-text("✓ Update")');

        await expect(page.locator('.todo-text').nth(1)).toHaveText('Call dentist to schedule appointment');
    });

    test('Mixed workflow: realistic daily usage pattern', async ({ page }) => {
        // User starts with a plan
        await page.fill('input.todo-input', 'Morning meeting');
        await page.click('button:has-text("+ Add")');
        await page.fill('input.todo-input', 'Finish report');
        await page.click('button:has-text("+ Add")');

        // User completes first task
        await page.locator('.todo-checkbox').first().click();

        // User adds urgent task
        await page.fill('input.todo-input', 'URGENT: Fix production bug');
        await page.click('button:has-text("+ Add")');

        // User edits to add more details
        await page.locator('button.btn-edit').nth(2).click();
        await page.fill('input.todo-input', 'URGENT: Fix production bug - login issue');
        await page.click('button:has-text("✓ Update")');

        // User completes urgent task
        await page.locator('.todo-item').filter({ hasText: 'URGENT' }).locator('.todo-checkbox').click();

        // User deletes completed urgent task
        await page.locator('.todo-item.completed').filter({ hasText: 'URGENT' }).locator('button.btn-delete').click();

        // User adds more tasks
        await page.fill('input.todo-input', 'Lunch break');
        await page.click('button:has-text("+ Add")');

        // Final state check
        await expect(page.locator('.todo-item')).toHaveCount(3);
        await expect(page.locator('.todo-item.completed')).toHaveCount(1);
    });

    test('Persistence journey: user closes and reopens app', async ({ page }) => {
        // User adds tasks
        await page.fill('input.todo-input', 'Task 1');
        await page.click('button:has-text("+ Add")');
        await page.fill('input.todo-input', 'Task 2');
        await page.click('button:has-text("+ Add")');

        // User completes one
        await page.locator('.todo-checkbox').first().click();

        // User closes browser (simulated by reload)
        await page.reload();

        // User sees their tasks preserved
        await expect(page.locator('.todo-item')).toHaveCount(2);
        await expect(page.locator('.todo-item.completed')).toHaveCount(1);
        await expect(page.locator('.todo-text').first()).toHaveText('Task 1');
        await expect(page.locator('.todo-text').nth(1)).toHaveText('Task 2');

        // User continues working
        await page.fill('input.todo-input', 'Task 3');
        await page.click('button:has-text("+ Add")');

        await expect(page.locator('.todo-item')).toHaveCount(3);
    });
});
