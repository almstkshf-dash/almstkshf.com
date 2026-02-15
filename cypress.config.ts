import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        viewportWidth: 1280,
        viewportHeight: 720,
        supportFile: 'cypress/support/e2e.ts',
        setupNodeEvents(on, config) { },
    },
})
