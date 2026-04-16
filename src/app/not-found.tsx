/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import Link from "next/link";

export default function NotFound() {
    return (
        <html lang="en" dir="ltr">
            <body className="bg-background text-foreground flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                    <p className="text-foreground/60">The page you are looking for does not exist.</p>
                    <Link href="/" className="mt-8 inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
                        Return Home
                    </Link>
                </div>
            </body>
        </html>
    );
}
