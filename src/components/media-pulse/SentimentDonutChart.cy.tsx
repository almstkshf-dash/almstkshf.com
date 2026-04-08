import React from 'react'
import SentimentDonutChart from './SentimentDonutChart'

describe('<SentimentDonutChart />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <SentimentDonutChart
        data={{ positive: 40, neutral: 35, negative: 25 }}
        nssIndex={15}
      />
    )
  })
})