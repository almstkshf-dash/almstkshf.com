/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import React from 'react'
import SmartMediaAssistantClient from './page'

describe('<SmartMediaAssistantPage />', () => {
  it('renders the assistant intro and input area', () => {
    cy.mount(<SmartMediaAssistantClient />);
    
    // Check for AI badge
    cy.contains('Powered by Gemini').should('be.visible');
    
    // Check for title
    cy.contains('Smart Media Assistant').should('be.visible');
    
    // Check for input area
    cy.get('textarea[placeholder*="Ask"]').should('be.visible');
    
    // Check for deploy button
    cy.contains('Deploy Assistant').should('be.visible');
  });

  it('allows typing a prompt', () => {
    cy.mount(<SmartMediaAssistantClient />);
    const prompt = 'Analyze the latest press releases about Almstkshf';
    cy.get('textarea').type(prompt);
    cy.get('textarea').should('have.value', prompt);
  });
})