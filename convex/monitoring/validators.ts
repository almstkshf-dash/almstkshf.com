/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { v } from "convex/values";

export const sentimentValidator = v.union(
    v.literal("Positive"),
    v.literal("Neutral"),
    v.literal("Negative")
);

export const sourceTypeValidator = v.union(
    v.literal("Online News"),
    v.literal("Social Media"),
    v.literal("Blog"),
    v.literal("Print"),
    v.literal("Press Release")
);

export const depthValidator = v.union(
    v.literal("standard"),
    v.literal("deep")
);

export const analysisStatusValidator = v.union(
    v.literal("pending"),
    v.literal("completed"),
    v.literal("failed")
);

export const languageValidator = v.union(
    v.literal("EN"),
    v.literal("AR")
);

export const queueStatusValidator = v.union(
    v.literal("pending"),
    v.literal("processing"),
    v.literal("completed"),
    v.literal("failed")
);

export const emotionsValidator = v.object({
    joy: v.number(),
    sadness: v.number(),
    anger: v.number(),
    fear: v.number(),
    surprise: v.number(),
    trust: v.number(),
});
