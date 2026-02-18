/// <reference types="cypress" />

describe('Advanced Module Testing', () => {

    beforeEach(() => {
        // Clear cookies and storage to have a clean state
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    describe('Localization & RTL', () => {
        it('should correctly apply RTL for Arabic and LTR for English', () => {
            // Check English
            cy.visit('/en');
            cy.get('html').should('have.attr', 'dir', 'ltr');
            cy.get('html').should('have.attr', 'lang', 'en');

            // Access Arabic directly (more robust for headless)
            cy.visit('/ar');
            cy.get('html').should('have.attr', 'dir', 'rtl');
            cy.get('html').should('have.attr', 'lang', 'ar');

            // Verify localized text in Navigation
            cy.contains('الرئيسية').should('be.visible');

            // Verify localized Pricing title (we just localized this)
            cy.visit('/ar/pricing');
            cy.contains('الخطط والأسعار').should('be.visible');
        });
    });

    describe('Stripe & Checkout (Integration)', () => {
        it('should navigate to pricing and trigger checkout flow', () => {
            cy.visit('/en/pricing');

            // Intercept the stripe checkout API call
            cy.intercept('POST', '/api/stripe/checkout').as('checkoutRequest');

            // Find a "Subscribe Now" button. 
            cy.contains('Subscribe Now').first().click();

            cy.wait('@checkoutRequest', { timeout: 15000 }).then((interception) => {
                expect(interception.request.body).to.have.property('productName');
                // We just need to know the API was called
            });
        });
    });

    describe('Chatbase AI Widget', () => {
        it('should inject the Chatbase script', () => {
            cy.visit('/en');
            // The script id is "chatbase-widget" in ChatbaseWidget.tsx
            cy.get('script#chatbase-widget', { timeout: 15000 }).should('exist');
        });
    });

    describe('Contact Form (Convex Integration)', () => {
        it('should successfully submit the contact form', () => {
            cy.visit('/en/contact');

            cy.get('#name').type('Cypress Automated Test');
            cy.get('#email').type('cypress@almstkshf.com');
            cy.get('#subject').type('Test Subject');
            cy.get('#message').type('This is a test message to verify the backend integration.');

            // Submit
            cy.get('button[type="submit"]').click();

            // Success message from en.json: "Thank you! Your message has been sent."
            cy.contains('Your message has been sent', { timeout: 15000 }).should('be.visible');
        });
    });

    describe('Metadata & SEO', () => {
        it('should have correct metadata for SEO', () => {
            cy.visit('/en');
            cy.title().should('not.be.empty');
            cy.get('meta[name="description"]').should('have.attr', 'content').and('not.be.empty');
            cy.get('h1').should('have.length', 1); // Single H1 per page rule
        });
    });
});
