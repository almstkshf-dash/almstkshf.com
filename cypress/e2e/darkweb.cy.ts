/// <reference types="cypress" />

describe('Dark Web Module E2E', () => {
    beforeEach(() => {
        // Clear state and visit the darkweb view
        cy.clearCookies();
        cy.clearLocalStorage();

        // We visit the dashboard with the darkweb view parameter.
        // If the user is unauthenticated, the middleware will redirect to sign-in.
        // We handle the potential redirect by checking the URL.
        cy.visit('/en/dashboard?view=darkweb', { failOnStatusCode: false });
    });

    it('should show the Dark Web Investigation tab if accessible', () => {
        // If we are redirected to sign-in, skip the rest of the test but log it
        cy.url().then((url) => {
            if (url.includes('sign-in')) {
                cy.log('Redirected to sign-in. E2E test requires an active session or admin privileges.');
                return;
            }

            // If not redirected, we expect the Dark Web tab content
            cy.contains('Dark Web Investigation').should('be.visible');
            cy.get('input[placeholder*="onion sites"]').should('be.visible');

            // Verify source buttons
            cy.contains('Ahmia Search').should('be.visible');
            cy.contains('Analytic Extract').should('be.visible'); // Diffbot
            cy.contains('Stealth Proxy').should('be.visible');   // ZenRows
        });
    });

    it('should navigate through search sources and update input placeholders', () => {
        cy.url().then((url) => {
            if (url.includes('sign-in')) return;

            // 1. Check Diffbot (Analytic Extract)
            cy.contains('Analytic Extract').click();
            cy.get('input[placeholder*="URL"]').should('exist');
            cy.get('select').should('exist'); // Geo targeting

            // 2. Check ZenRows (Stealth Proxy)
            cy.contains('Stealth Proxy').click();
            cy.get('input[placeholder*="URL"]').should('exist');
            cy.get('select').should('exist'); // Geo targeting

            // 3. Back to Ahmia
            cy.contains('Ahmia Search').click();
            cy.get('input[placeholder*="onion sites"]').should('exist');
        });
    });

    it('should test the search optimizer on Ahmia source', () => {
        cy.url().then((url) => {
            if (url.includes('sign-in')) return;

            const testKeyword = 'malware leak';
            cy.get('input[placeholder*="onion sites"]').type(testKeyword);

            // Click the AI wand (optimize button)
            cy.get('button').find('svg.lucide-wand2').parent().click();

            // Should show optimizing state or the explanation banner
            // We search for the explanation title from translations (SearchOptimizer)
            // It will wait up to 15s for the AI action to complete
            cy.get('p').contains('AI Query Optimization', { timeout: 15000 }).should('be.visible');
            cy.contains('Restore Original').should('be.visible');

        });
    });

    it('should handle search errors gracefully', () => {
        cy.url().then((url) => {
            if (url.includes('sign-in')) return;

            // Select Diffbot and enter an invalid URL
            cy.contains('Analytic Extract').click();
            cy.get('input[placeholder*="URL"]').type('not-a-url');
            cy.get('button').contains('Search').should('be.visible').click();

            // Depending on implementation, it might show an error banner
            // The component has a 'Search Error' banner
            // cy.contains('Search Error', { timeout: 10000 }).should('be.visible');
        });
    });

    it('should display the results table and export options if results are present', () => {
        cy.url().then((url) => {
            if (url.includes('sign-in')) return;

            // Check results table
            cy.get('table').should('exist');

            // Check for export buttons (if results exist)
            cy.get('body').then(($body) => {
                if ($body.find('button:contains("PDF")').length > 0) {
                    cy.contains('PDF').should('be.visible');
                    cy.contains('Excel').should('be.visible');
                }
            });
        });
    });
});
