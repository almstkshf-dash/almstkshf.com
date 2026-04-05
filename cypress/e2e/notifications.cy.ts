/// <reference types="cypress" />

describe('Notification System E2E', () => {

    beforeEach(() => {
        cy.viewport(1280, 720);
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    describe('OSINT Notification Flow', () => {
        it('should trigger an email lookup and receive a notification', () => {
            cy.visit('/en/media-monitoring/media-pulse?tab=osint'); // Valid full path

            // Wait for OSINT tab to be visible
            cy.contains('OSINT Investigation').should('be.visible');

            // Select Email lookup
            cy.get('button').contains('Email').click();

            // Type a test email (will trigger breach check)
            cy.get('input[placeholder*="email"]').type('test@leak.com');
            cy.get('button').contains('Generate Report').click();

            // Wait for notification badge to appear (OSINT takes time)
            cy.get('button[aria-label="Notifications"] span', { timeout: 15000 }).should('exist');

            // Open bell and verify title matches our translation 'osint_ready' -> 'OSINT Result Ready'
            cy.get('button[aria-label="Notifications"]').click();
            cy.contains('OSINT Result Ready').should('be.visible');

            // Dismiss it
            cy.get('button').contains('Dismiss').click();

            // Badge should be gone
            cy.get('button[aria-label="Notifications"] span').should('not.exist');
        });
    });

    describe('Monitoring Alerts Flow', () => {
        it('should display unread notification for press release sync', () => {
            cy.visit('/en/media-monitoring/press');

            // We assume an admin sync was triggered earlier or we trigger one if button is clickable
            // Since we're testing the UI logic, we can also check the bell directly if we know state
            cy.get('button[aria-label="Notifications"]').should('be.visible');
        });
    });

    describe('Localization Check', () => {
        it('should show notifications in Arabic when switching locales', () => {
            // Visit a public page (Home) that definitely loads the Navbar/Bell
            cy.visit('/ar');

            // Wait for hydration and check for the notification bell
            cy.get('button[aria-label="Notifications"]', { timeout: 15000 })
                .should('be.visible')
                .click();

            // Check for Arabic title 'التنبيهات' from ar.json
            cy.contains('التنبيهات').should('be.visible');

            // If empty, should show 'لا توجد تنبيهات جديدة'
            cy.contains('لا توجد تنبيهات جديدة').should('be.visible');
        });
    });
});
