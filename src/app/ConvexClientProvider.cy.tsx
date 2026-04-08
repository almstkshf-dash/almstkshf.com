import React from 'react'
import { ConvexClientProvider } from './ConvexClientProvider'

describe('<ConvexClientProvider />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<ConvexClientProvider><div>Test</div></ConvexClientProvider>)
  })
})