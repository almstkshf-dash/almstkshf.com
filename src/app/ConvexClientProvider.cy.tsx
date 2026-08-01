/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import React from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ConvexClientProvider } from './ConvexClientProvider'

function HookConsumer() {
  const joinWaitlist = useMutation(api.waitlist.joinWaitlist)
  return <div data-cy="hook-consumer">{joinWaitlist ? 'ready' : 'not-ready'}</div>
}

describe('<ConvexClientProvider />', () => {
  it('renders children that use Convex hooks even without a configured deployment URL', () => {
    cy.mount(
      <ConvexClientProvider>
        <HookConsumer />
      </ConvexClientProvider>
    )

    cy.get('[data-cy="hook-consumer"]').should('contain.text', 'ready')
  })
})