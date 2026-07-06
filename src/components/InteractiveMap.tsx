/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

export default function InteractiveMap() {
    const t = useTranslations("Contact.channels");
    const [activeBranch, setActiveBranch] = useState<"dubai" | "abudhabi">("dubai");

    const maps = {
        dubai: {
            title: "Dubai One Central Office",
            embedUrl: "https://maps.google.com/maps?q=One%20Central%20Dubai&t=&z=15&ie=UTF8&iwloc=&output=embed"
        },
        abudhabi: {
            title: "Abu Dhabi Al Khatem Tower Office",
            embedUrl: "https://maps.google.com/maps?q=Al%20Khatem%20Tower%20Abu%20Dhabi&t=&z=15&ie=UTF8&iwloc=&output=embed"
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2 p-1.5 bg-slate-950 border border-slate-800/80 rounded-2xl w-fit">
                <button
                    type="button"
                    onClick={() => setActiveBranch("dubai")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 ${
                        activeBranch === "dubai"
                            ? "bg-slate-900 text-blue-400 border border-slate-800 shadow-lg"
                            : "text-slate-500 hover:text-slate-300"
                    }`}
                >
                    <MapPin className="w-3.5 h-3.5" />
                    {t("map_dubai_tab")}
                </button>
                <button
                    type="button"
                    onClick={() => setActiveBranch("abudhabi")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 ${
                        activeBranch === "abudhabi"
                            ? "bg-slate-900 text-indigo-400 border border-slate-800 shadow-lg"
                            : "text-slate-500 hover:text-slate-300"
                    }`}
                >
                    <MapPin className="w-3.5 h-3.5" />
                    {t("map_abudhabi_tab")}
                </button>
            </div>

            <div className="aspect-video w-full rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden relative group">
                <iframe
                    src={maps[activeBranch].embedUrl}
                    title={maps[activeBranch].title}
                    width="100%"
                    height="100%"
                    style={{
                        border: 0,
                        filter: "invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)",
                        opacity: 0.85,
                    }}
                    allowFullScreen={false}
                    loading="lazy"
                    className="w-full h-full transition-opacity duration-500 group-hover:opacity-100"
                ></iframe>
            </div>
        </div>
    );
}
