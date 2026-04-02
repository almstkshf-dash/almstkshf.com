/// <reference types="cypress" />

describe('Gemini API Key Resolution', () => {
    beforeEach(() => {
        // We assume the user is already authenticated in the authorized browser session
        // or we use the custom command if available.
        cy.visit('/dashboard/settings/api-keys');
    });

    it('should allow an admin to set and verify a BYOK Gemini key', () => {
        const mockKey = 'AIzaSy-TEST-KEY-1234567890';
        
        // 1. Enter the key
        cy.get('input[id="gemini-key"]').clear().type(mockKey);
        
        // 2. Click Save
        cy.get('button').filter(':has(svg.lucide-save), :contains("Save")').first().click();
        
        // 3. Verify Success Message (Arabic or English)
        cy.get('div').should('satisfy', ($el) => {
            const text = $el.text();
            return text.includes('saved') || text.includes('بنجاح');
        });

        // 4. Verify the input still holds the value (or is masked)
        cy.get('input[id="gemini-key"]').should('have.value', mockKey);
    });

    it('should respect the "BYOK First" priority logic', () => {
        // This test verifies the UI labels/hints that explain the priority
        cy.contains('BYOK').should('be.visible');
        cy.contains('الأولوية').should('be.visible'); // Arabic for Priority
    });
});
