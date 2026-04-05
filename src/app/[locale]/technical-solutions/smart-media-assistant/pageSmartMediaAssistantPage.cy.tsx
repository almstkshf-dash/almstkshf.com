import React from 'react'
import SmartMediaAssistantPage from './page'

describe('<SmartMediaAssistantPage />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<SmartMediaAssistantPage />)
  })
})