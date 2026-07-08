/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { Globe, Languages as LanguagesIcon, Filter } from 'lucide-react';
import { MultiSelectDropdown } from '@/components/ui/MultiSelectDropdown';
import { ALL_COUNTRIES, LANGUAGES } from '@/lib/countries';

interface FiltersProps {
    selectedCountries: string[];
    selectedLanguages: string[];
    selectedSourceTypes: string[];
    onCountriesChange: (v: string[]) => void;
    onLanguagesChange: (v: string[]) => void;
    onSourceTypesChange: (v: string[]) => void;
    countryMap: Map<string, { code: string; flag: string; en: string; ar: string }>;
    errors: { countries?: string; languages?: string };
    isAr: boolean;
    t: any;
}

export const Filters: React.FC<FiltersProps> = React.memo(({
    selectedCountries,
    selectedLanguages,
    selectedSourceTypes,
    onCountriesChange,
    onLanguagesChange,
    onSourceTypesChange,
    countryMap,
    errors,
    isAr,
    t,
}) => {
    // Country helpers (memoized as they can be larger)
    const countryItems = useMemo(() => ALL_COUNTRIES.map((c) => ({
        id: c.code,
        label: isAr ? c.ar : c.en,
        searchStr: `${c.en} ${c.ar} ${c.code}`,
    })), [isAr]);

    // Language helpers (memoized)
    const languageItems = useMemo(() => LANGUAGES.map((l) => ({
        id: l.code,
        label: isAr ? l.ar : l.en,
        searchStr: `${l.en} ${l.ar} ${l.code}`,
    })), [isAr]);

    // Unmemoized small array as per optimization guidelines (Point 15)
    const sourceTypes = [
        { id: 'Online News', label: t('source_types_list.online_news'), searchStr: 'Online News أخبار عبر الإنترنت' },
        { id: 'Press Release', label: t('source_types_list.press_release'), searchStr: 'Press Release بيان صحفي' },
        { id: 'Blog', label: t('source_types_list.blog'), searchStr: 'Blog مدونة' },
        { id: 'Social Media', label: t('source_types_list.social_media'), searchStr: 'Social Media وسائل التواصل الاجتماعي' },
        { id: 'Print', label: t('source_types_list.print'), searchStr: 'Print صحافة مطبوعة' },
    ];

    return (
        <>
            {/* Countries */}
            <div className="space-y-2">
                <span id="region-label" className="block text-[11px] text-foreground/70 font-bold uppercase tracking-widest transition-colors px-1">
                    {t('region')}
                </span>
                <MultiSelectDropdown
                    id="region-select"
                    aria-labelledby="region-label"
                    items={countryItems}
                    selected={selectedCountries}
                    onChange={onCountriesChange}
                    placeholder={t('select_countries')}
                    searchPlaceholder={t('search_countries')}
                    selectedText={t('selected')}
                    selectAllText={t('select_all')}
                    clearAllText={t('clear_all')}
                    icon={<Globe className="w-4 h-4" />}
                    renderItem={(item) => (
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{countryMap.get(item.id)?.flag}</span>
                            <span>{item.label}</span>
                        </div>
                    )}
                    renderTag={(id) => (
                        <div className="flex items-center gap-1.5">
                            <span>{countryMap.get(id)?.flag}</span>
                            <span>{id}</span>
                        </div>
                    )}
                />
                {errors.countries && (
                    <p className="text-destructive text-[11px] px-1 transition-all">{errors.countries}</p>
                )}
            </div>

            {/* Languages */}
            <div className="space-y-2">
                <span id="language-label" className="block text-[11px] text-foreground/70 font-bold uppercase tracking-widest transition-colors px-1">
                    {t('language')}
                </span>
                <MultiSelectDropdown
                    id="language-select"
                    aria-labelledby="language-label"
                    items={languageItems}
                    selected={selectedLanguages}
                    onChange={onLanguagesChange}
                    placeholder={t('select_languages')}
                    searchPlaceholder={t('search_languages')}
                    selectedText={t('selected')}
                    selectAllText={t('select_all')}
                    clearAllText={t('clear_all')}
                    icon={<LanguagesIcon className="w-4 h-4" />}
                    renderItem={(item) => (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold opacity-60 uppercase">{item.id}</span>
                            <span>{item.label}</span>
                        </div>
                    )}
                    renderTag={(id) => (
                        <span className="uppercase text-[10px] font-black">{id}</span>
                    )}
                />
                {errors.languages && (
                    <p className="text-destructive text-[11px] px-1 transition-all">{errors.languages}</p>
                )}
            </div>

            {/* Source Types */}
            <div className="space-y-2">
                <span id="sources-label" className="block text-[11px] text-foreground/70 font-bold uppercase tracking-widest transition-colors px-1">
                    {t('source_types')}
                </span>
                <MultiSelectDropdown
                    id="sources-select"
                    aria-labelledby="sources-label"
                    items={sourceTypes}
                    selected={selectedSourceTypes}
                    onChange={onSourceTypesChange}
                    placeholder={t('select_sources')}
                    searchPlaceholder={t('search_sources')}
                    selectedText={t('sources_selected')}
                    selectAllText={t('select_all')}
                    clearAllText={t('clear_all')}
                    icon={<Filter className="w-4 h-4" />}
                />
            </div>
        </>
    );
});

Filters.displayName = 'Filters';
