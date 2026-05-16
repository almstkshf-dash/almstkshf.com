/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import React from 'react'
import MediaMonitoringDashboard from './MediaMonitoringDashboard'

describe('<MediaMonitoringDashboard />', () => {
  it('renders all filter chips and the coverage log', () => {
    cy.mount(<MediaMonitoringDashboard />);
    
    // Check main title
    cy.contains('Coverage Log').should('be.visible');
    
    // Check filter chips
    cy.contains('All').should('be.visible');
    cy.contains('Online News').should('be.visible');
    cy.contains('Social Media').should('be.visible');
    cy.contains('Press').should('be.visible');
    
    // Check search input
    cy.get('input[placeholder*="Search"]').should('be.visible');
  });

  it('changes filter when a chip is clicked', () => {
    cy.mount(<MediaMonitoringDashboard />);
    
    cy.contains('Press').click();
    cy.contains('Press').should('have.class', 'bg-primary');
  });
})