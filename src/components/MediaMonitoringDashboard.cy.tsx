import React from 'react'
import MediaMonitoringDashboard from './MediaMonitoringDashboard'

describe('<MediaMonitoringDashboard />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<MediaMonitoringDashboard />)
  })
})