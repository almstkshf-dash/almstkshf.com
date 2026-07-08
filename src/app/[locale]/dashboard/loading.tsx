/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="flex h-[80vh] w-full items-center justify-center bg-background/50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" aria-hidden="true" />
                <p className="text-sm text-muted-foreground animate-pulse">Loading dashboard content...</p>
            </div>
        </div>
    );
}
