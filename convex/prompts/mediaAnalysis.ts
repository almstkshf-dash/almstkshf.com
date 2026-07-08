/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { buildAnalysisPrompt } from "./common";

/**
 * Returns the reputation and risk analysis prompt for raw media input,
 * structured with safety instructions and multi-lingual guidelines.
 */
export function getMediaAnalysisPrompt(text: string): string {
    return buildAnalysisPrompt({
        text,
    });
}
