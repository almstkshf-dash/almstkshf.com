/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from 'next';
import TestFetchClient from '@/components/TestFetchClient';

export const metadata: Metadata = {
    title: 'Test Fetch | Almstkshf',
    robots: {
        index: false,
        follow: false,
    },
};

export default function TestFetchPage() {
    return <TestFetchClient />;
}
