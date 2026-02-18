import { test, expect } from '@playwright/test';

/**
 * Smoke tests — run against the live deployed URL after each deployment.
 * These are intentionally minimal: just confirm the app is up and functional.
 */
test.describe('Smoke Tests — Live Deployment', () => {
    test('app loads and displays the main heading', async ({ page }) => {
        await page.goto('/');

        // The page title should be set
        await expect(page).toHaveTitle(/todo/i);

        // The main heading should be visible
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('todo input field is visible and accepts text', async ({ page }) => {
        await page.goto('/');

        const input = page.getByPlaceholder(/add.*task|new.*todo|what.*do/i).first();
        await expect(input).toBeVisible();
        await input.fill('Smoke test task');
        await expect(input).toHaveValue('Smoke test task');
    });

    test('can add a todo item end-to-end', async ({ page }) => {
        await page.goto('/');

        const input = page.getByPlaceholder(/add.*task|new.*todo|what.*do/i).first();
        await input.fill('Deployment smoke test ✅');

        // Submit by pressing Enter or clicking the add button
        await Promise.any([
            input.press('Enter'),
            page.getByRole('button', { name: /add/i }).click(),
        ]).catch(() => input.press('Enter'));

        // The new item should appear in the list
        await expect(page.getByText('Deployment smoke test ✅')).toBeVisible();
    });
});
