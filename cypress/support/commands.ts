/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
export {}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to update API keys in settings page
             * @example cy.updateApiKey('gemini', 'AIza...')
             */
            updateApiKey(service: string, key: string): Chainable<void>;
        }
    }
}

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
// -- Custom command to update API keys in settings --
Cypress.Commands.add('updateApiKey', (service: string, key: string) => {
    // Navigate to settings page (locale agnostic)
    cy.visit('/dashboard/settings/api-keys');

    if (service === 'gemini') {
        const input = cy.get('input[id="gemini-key"]');
        input.clear().type(key);
        cy.get('button').filter(':has(svg.lucide-save), :contains("Save")').first().click();
    }
    
    // Verify success message
    cy.get('div').filter(':contains("saved"), :contains("بنجاح")').should('be.visible');
});
