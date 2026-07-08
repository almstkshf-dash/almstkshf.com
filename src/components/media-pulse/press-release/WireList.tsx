/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

// PR wire sources metadata (mirrored from backend for display)
export const PR_WIRES = [
    { name: "Sky News Arabia (X)", region: 'AE', flag: '🇦🇪' },
    { name: "Al Arabiya (X)", region: 'SA', flag: '🇸🇦' },
    { name: "Al Jazeera Mubasher (X)", region: 'QA', flag: '🇶🇦' },
    { name: "Al Kass TV (X)", region: 'QA', flag: '🇶🇦' },
    { name: "Dubai PR Network", region: 'AE', flag: '🇦🇪' },
    { name: "Arab News", region: 'SA', flag: '🇸🇦' },
    { name: "Newswire_com", region: 'US', flag: '🇺🇸' },
    { name: "Asharq Al-Awsat", region: 'SA', flag: '🇸🇦' },
    { name: "Hashtag Dubai", region: 'AE', flag: '🇦🇪' },
    { name: "My Dubai News", region: 'AE', flag: '🇦🇪' },
    { name: "Al Badia Magazine", region: 'AE', flag: '🇦🇪' },
    { name: "Al Madar Magazine", region: 'AE', flag: '🇦🇪' },
    { name: "First Avenue Magazine", region: 'AE', flag: '🇦🇪' },
    { name: "Evision Worlds", region: 'AE', flag: '🇦🇪' },
    { name: "Pan Time Arabia", region: 'AE', flag: '🇦🇪' },
    { name: "Food Safety News", region: 'US', flag: '🇺🇸' },
    { name: "Energy Intel", region: 'US', flag: '🇺🇸' },
    { name: "Business Day", region: 'ZA', flag: '🇿🇦' },
    { name: "India News Network", region: 'IN', flag: '🇮🇳' },
    { name: "Al Wahda News", region: 'AE', flag: '🇦🇪' },
    { name: "Nabd El Emirate", region: 'AE', flag: '🇦🇪' },
    { name: "24.ae", region: 'AE', flag: '🇦🇪' },
    { name: "UAE Barq", region: 'AE', flag: '🇦🇪' },
    { name: "Gulf Time", region: 'AE', flag: '🇦🇪' },
    { name: "New Vora Group", region: 'AE', flag: '🇦🇪' },
    { name: "Ain Al Emirate", region: 'AE', flag: '🇦🇪' },
    { name: "Mena Scoop", region: 'AE', flag: '🇦🇪' },
    { name: "Provoke Media", region: 'GB', flag: '🇬🇧' },
    { name: "The New Yorker", region: 'US', flag: '🇺🇸' },
    { name: "Wired", region: 'US', flag: '🇺🇸' },
    { name: "Emirates247", region: 'AE', flag: '🇦🇪' },
    { name: "NPR", region: 'US', flag: '🇺🇸' },
    { name: "Fox News", region: 'US', flag: '🇺🇸' },
    { name: "BBC News", region: 'GB', flag: '🇬🇧' },
    { name: "Yahoo News", region: 'US', flag: '🇺🇸' },
    { name: "LA Times", region: 'US', flag: '🇺🇸' },
    { name: "CS Monitor", region: 'US', flag: '🇺🇸' },
    { name: "NBC News", region: 'US', flag: '🇺🇸' },
    { name: "The Guardian", region: 'GB', flag: '🇬🇧' },
    { name: "ABC News", region: 'US', flag: '🇺🇸' },
    { name: "Deadline", region: 'US', flag: '🇺🇸' },
    { name: "Vulture", region: 'US', flag: '🇺🇸' },
    { name: "CNN", region: 'US', flag: '🇺🇸' },
    { name: "Esquire", region: 'US', flag: '🇺🇸' },
    { name: "CBS News", region: 'US', flag: '🇺🇸' },
    { name: "TMZ", region: 'US', flag: '🇺🇸' },
    { name: "BuzzFeed", region: 'US', flag: '🇺🇸' },
    { name: "Variety", region: 'US', flag: '🇺🇸' },
];

export default function WireList() {
    return (
        <div className="flex flex-wrap gap-2">
            {PR_WIRES.map(w => (
                <span
                    key={w.name}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-muted border border-border text-foreground/70"
                >
                    <span>{w.flag}</span>
                    {w.name}
                </span>
            ))}
        </div>
    );
}
