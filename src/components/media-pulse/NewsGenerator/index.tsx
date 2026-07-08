/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import * as React from 'react';
import { Search, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import clsx from 'clsx';
import Button from '../../ui/Button';
import { useNewsGenerator } from './useNewsGenerator';
import { KeywordInput } from './KeywordInput';
import { Filters } from './Filters';
import { DateRange } from './DateRange';
import { GenerateButton } from './GenerateButton';

export default function NewsGenerator({ defaultSourceType, hideHeader }: { defaultSourceType?: string; hideHeader?: boolean }) {
    const {
        keyword,
        optimizationInfo,
        isOptimizing,
        selectedCountries,
        selectedLanguages,
        dateFrom,
        dateTo,
        selectedSourceTypes,
        loading,
        result,
        errorMsg,
        retryCountdown,
        errors,
        countryMap,
        isAuthenticated,
        authLoading,
        handleKeywordChange,
        handleCountriesChange,
        handleLanguagesChange,
        handleDateFromChange,
        handleDateToChange,
        setSelectedSourceTypes,
        handleGenerate,
        clearForm,
        handleOptimize,
        t,
        tOpt,
        isAr,
    } = useNewsGenerator({ defaultSourceType });

    return (
        <section className={clsx("relative z-20 overflow-visible transition-all", !hideHeader && "bg-card border border-border rounded-2xl backdrop-blur-sm shadow-sm")}>
            {/* Header */}
            {!hideHeader && (
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center transition-colors">
                            <Search className="w-4.5 h-4.5 text-blue-800 dark:text-blue-300" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 className="text-foreground font-bold text-sm transition-colors">{t('monitor_keyword')}</h2>
                            <p className="text-foreground/70 text-[11px] transition-colors">{t('subtitle')}</p>
                        </div>
                    </div>
                    {(keyword || result || errorMsg) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearForm}
                            className="text-xs text-foreground/80 hover:text-foreground gap-1 border border-border rounded-lg px-3 py-1.5 hover:bg-muted/50 h-auto shadow-none"
                        >
                            <X className="w-3 h-3" />
                            {t('clear')}
                        </Button>
                    )}
                </div>
            )}

            <div className={clsx(hideHeader ? "space-y-6" : "p-6 space-y-6")}>
                <KeywordInput
                    keyword={keyword}
                    onChange={handleKeywordChange}
                    onOptimize={handleOptimize}
                    isOptimizing={isOptimizing}
                    error={errors.keyword}
                    optimizationInfo={optimizationInfo}
                    onResetOptimization={clearForm}
                    onEnter={handleGenerate}
                    t={t}
                    tOpt={tOpt}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Filters
                        selectedCountries={selectedCountries}
                        selectedLanguages={selectedLanguages}
                        selectedSourceTypes={selectedSourceTypes}
                        onCountriesChange={handleCountriesChange}
                        onLanguagesChange={handleLanguagesChange}
                        onSourceTypesChange={setSelectedSourceTypes}
                        countryMap={countryMap}
                        errors={errors}
                        isAr={isAr}
                        t={t}
                    />

                    <DateRange
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        onDateFromChange={handleDateFromChange}
                        onDateToChange={handleDateToChange}
                        error={errors.dateRange}
                        t={t}
                    />
                </div>

                <div className="pt-4 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                        {errorMsg && (
                            <div className="text-destructive text-xs flex items-center gap-2 animate-slide-in-from-left transition-all">
                                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                                {errorMsg}
                            </div>
                        )}
                        {result && (
                            <div className="text-emerald-500 text-xs flex items-center gap-2 animate-slide-in-from-left transition-all">
                                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                {t('result_success', { count: result.count ?? 0, skipped: result.skipped ?? 0, feeds: result.feeds ?? 0 })}
                            </div>
                        )}
                    </div>

                    <GenerateButton
                        onClick={handleGenerate}
                        loading={loading}
                        authLoading={authLoading}
                        isAuthenticated={isAuthenticated}
                        retryCountdown={retryCountdown}
                        t={t}
                    />
                </div>
            </div>
        </section>
    );
}
