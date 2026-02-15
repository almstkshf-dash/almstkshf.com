/// <reference types="cypress" />

describe('Navigation', () => {
    it('should have a working home page', () => {
        // Start from the index page
        cy.visit('/')

        // The page should contain the app name or logo alt text
        // Based on Navbar.tsx, alt is tCommon('app_name') which is likely "ALMSTKSHF" or "المستكشف"
        // We can check for the logo image
        cy.get('img[alt*="ALMSTKSHF"]').should('be.visible')

        // Check for Contact link
        cy.get('a[href*="/contact"]').should('exist')
    })

    it('should navigate to the pricing page', () => {
        cy.visit('/')

        // Wait for redirect to /en or /ar
        cy.url().should('match', /\/(en|ar)$/)

        // Use Pricing link as it's always visible regardless of auth state
        cy.get('nav a[href*="pricing"]').filter(':visible').first().click()

        // Wait for the new page content to appear. 
        // We look for the "Plans & Pricing" text which is unique to this page.
        cy.contains('Plans & Pricing', { timeout: 15000 }).should('be.visible')

        // Now the URL should definitely be updated
        cy.url().should('include', '/pricing')
    })
})

describe('Localization', () => {
    it('should switch between English and Arabic', () => {
        cy.visit('/')

        // Wait for redirect to /en
        cy.url({ timeout: 10000 }).should('include', '/en')
        cy.get('html').should('have.attr', 'lang', 'en')

        // Find language toggle and click it
        cy.get('button[aria-label="Switch Language"]').filter(':visible').first().click()

        // Wait for URL to update to /ar
        cy.url({ timeout: 10000 }).should('include', '/ar')
        cy.get('html').should('have.attr', 'lang', 'ar')
        cy.get('html').should('have.attr', 'dir', 'rtl')

        // Switch back
        cy.get('button[aria-label="Switch Language"]').filter(':visible').first().click()
        cy.url({ timeout: 10000 }).should('include', '/en')
        cy.get('html').should('have.attr', 'lang', 'en')
    })
})

describe('Theme', () => {
    it('should toggle between dark and light mode', () => {
        cy.visit('/')

        // Wait for page load
        // Toggle theme (exact behavior depends on ThemeToggle implementation, 
        // usually checks for class or data-theme on html/body)
        // We look for the toggle button in navbar
        cy.get('button[aria-label="Toggle theme"]').filter(':visible').first().as('themeToggle')

        // Assuming light mode might be default or system, let's just toggle and check class
        cy.get('html').then(($html) => {
            const isDark = $html.hasClass('dark')

            cy.get('@themeToggle').click()

            if (isDark) {
                cy.get('html').should('not.have.class', 'dark')
            } else {
                cy.get('html', { timeout: 10000 }).should('have.class', 'dark')
            }
        })
    })
})

describe('Contact Form', () => {
    it('should validate and submit the contact form', () => {
        // Use explicit locale to avoid double redirect issues
        cy.visit('/en/contact')

        // Try submitting empty form
        cy.get('button[type="submit"]').click()
        cy.get('input:invalid').should('have.length.at.least', 1)

        // Fill form
        cy.get('#name').type('Cypress Tester')
        cy.get('#email').type('test@example.com')
        cy.get('#subject').type('E2E Test Subject')
        cy.get('#message').type('This is an automated test message from Cypress.')

        // Submit.
        cy.get('button[type="submit"]').click()

        // Wait for success message (Next-intl success translation)
        cy.contains('sent successfully', { timeout: 20000, matchCase: false }).should('be.visible')
    })
})

describe('Authentication', () => {
    it('should redirect unauthenticated users from dashboard to sign-in', () => {
        // Access a protected route with locale prefix
        cy.visit('/en/dashboard', { failOnStatusCode: false })

        // Clerk should redirect to its hosted sign-in page or a local /sign-in route
        cy.url({ timeout: 15000 }).should('include', 'sign-in')
    })
})

describe('Responsive Layout', () => {
    const viewports: Cypress.ViewportPreset[] = ['iphone-6', 'macbook-13']

    viewports.forEach((viewport) => {
        it(`should render correctly on ${viewport}`, () => {
            cy.viewport(viewport)
            cy.visit('/')

            if (viewport === 'iphone-6') {
                // Mobile menu button should be visible (using svg-based check if no label)
                cy.get('button').filter(':has(svg.lucide-menu), :has(svg[data-lucide="menu"])').should('be.visible')
            } else if (viewport === 'macbook-13') {
                // Desktop nav should be visible (check for unique desktop nav element)
                cy.get('header').find('nav').should('be.visible')
            }
        })
    })
})
