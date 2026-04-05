import React from 'react'
import SentimentDonutChart from './SentimentDonutChart'

describe('<SentimentDonutChart />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<SentimentDonutChart />)
  })
})