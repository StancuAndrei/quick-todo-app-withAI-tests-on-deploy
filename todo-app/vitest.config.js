import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './tests/setup.js',
        css: true,
        // Only run files inside tests/unit/ — prevents Playwright spec files from being picked up
        include: ['tests/unit/**/*.{test,spec}.{js,jsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'tests/',
                '*.config.js',
            ],
        },
    },
})

