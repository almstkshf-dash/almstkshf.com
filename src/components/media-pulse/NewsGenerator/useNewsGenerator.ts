/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAction, useConvexAuth } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useLocale, useTranslations } from 'next-intl';
import { ALL_COUNTRIES, LANGUAGES } from '@/lib/countries';
import { FetchNewsSchema, OptimizeQuerySchema, NewsGeneratorFormSchema } from './validation';
import { FetchNewsResponse } from '@/types/api';

export function useNewsGenerator({ defaultSourceType }: { defaultSourceType?: string }) {
    const locale = useLocale();
    const t = useTranslations('NewsGenerator');
    const tOpt = useTranslations('SearchOptimizer');
    const isAr = locale === 'ar';

    const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
    const fetchNewsAction = useAction(api.monitoringAction.fetchNews);
    const optimizeSearchAction = useAction(api.searchOptimizer.optimizeQuery);

    const [keyword, setKeyword] = useState('');
    const [optimizationInfo, setOptimizationInfo] = useState<{ original: string; explanation: string } | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [selectedCountries, setSelectedCountries] = useState<string[]>(['AE']);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(isAr ? ['ar', 'en'] : ['en', 'ar']);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedSourceTypes, setSelectedSourceTypes] = useState<string[]>(
        defaultSourceType ? [defaultSourceType] : ['Online News', 'Press Release']
    );

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<FetchNewsResponse | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

    // Validation errors
    const [errors, setErrors] = useState<{ keyword?: string; countries?: string; languages?: string; dateRange?: string }>({});

    // Abort controller ref to manage active requests and unmounts
    const abortControllerRef = useRef<AbortController | null>(null);

    // O(1) Maps for country/language lookups
    const countryMap = useMemo(() => new Map(ALL_COUNTRIES.map(c => [c.code, c])), []);

    // Convert HTML date (YYYY-MM-DD) → DD/MM/YYYY for backend
    const formatDateForBackend = useCallback((htmlDate: string): string => {
        if (!htmlDate) return '';
        const [y, m, d] = htmlDate.split('-');
        return `${d}/${m}/${y}`;
    }, []);

    // Perform validation
    const validate = useCallback((): boolean => {
        const parsed = NewsGeneratorFormSchema.safeParse({
            keyword: keyword.trim(),
            countries: selectedCountries,
            languages: selectedLanguages,
            sourceTypes: selectedSourceTypes,
            dateFrom,
            dateTo,
        });

        if (!parsed.success) {
            const newErrors: typeof errors = {};
            parsed.error.issues.forEach((issue) => {
                const key = issue.path[0] as keyof typeof errors;
                // Get error message and map to translation key
                newErrors[key] = t(issue.message as any);
            });
            setErrors(newErrors);
            return false;
        }

        setErrors({});
        return true;
    }, [keyword, selectedCountries, selectedLanguages, selectedSourceTypes, dateFrom, dateTo, t]);

    // Handle countdown timer
    useEffect(() => {
        if (retryCountdown === null) return;
        if (retryCountdown <= 0) {
            setRetryCountdown(null);
            setErrorMsg(t('ready_to_retry'));
            return;
        }
        const timer = setInterval(() => {
            setRetryCountdown(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
        return () => clearInterval(timer);
    }, [retryCountdown, t]);

    // Cleanup abort controller on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Form inputs real-time validation / handlers
    const handleKeywordChange = useCallback((val: string) => {
        setKeyword(val);
        if (optimizationInfo) setOptimizationInfo(null);
        
        // Real-time validation for keyword
        if (!val.trim()) {
            setErrors(prev => ({ ...prev, keyword: t('error_keyword_required') }));
        } else if (val.trim().length > 300) {
            setErrors(prev => ({ ...prev, keyword: t('error_keyword_too_long') }));
        } else {
            setErrors(prev => ({ ...prev, keyword: undefined }));
        }
    }, [optimizationInfo, t]);

    const handleCountriesChange = useCallback((v: string[]) => {
        setSelectedCountries(v);
        if (v.length > 0) {
            setErrors(prev => ({ ...prev, countries: undefined }));
        } else {
            setErrors(prev => ({ ...prev, countries: t('error_country_required') }));
        }
    }, [t]);

    const handleLanguagesChange = useCallback((v: string[]) => {
        setSelectedLanguages(v);
        if (v.length > 0) {
            setErrors(prev => ({ ...prev, languages: undefined }));
        } else {
            setErrors(prev => ({ ...prev, languages: t('error_language_required') }));
        }
    }, [t]);

    const handleDateFromChange = useCallback((val: string) => {
        setDateFrom(val);
        if (val && dateTo && val > dateTo) {
            setErrors(prev => ({ ...prev, dateRange: t('error_date_range_invalid') }));
        } else {
            setErrors(prev => ({ ...prev, dateRange: undefined }));
        }
    }, [dateTo, t]);

    const handleDateToChange = useCallback((val: string) => {
        setDateTo(val);
        if (dateFrom && val && dateFrom > val) {
            setErrors(prev => ({ ...prev, dateRange: t('error_date_range_invalid') }));
        } else {
            setErrors(prev => ({ ...prev, dateRange: undefined }));
        }
    }, [dateFrom, t]);

    const handleGenerate = useCallback(async () => {
        if (!validate()) return;

        // Concurrency / safety check
        if (authLoading) {
            return;
        }

        if (!isAuthenticated) {
            setErrorMsg(t('not_authenticated'));
            return;
        }

        // Cancel previous request if one is running
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const signal = controller.signal;

        setLoading(true);
        setResult(null);
        setErrorMsg('');

        try {
            const countriesParam = selectedCountries.length === ALL_COUNTRIES.length ? 'ALL' : selectedCountries.join(',');
            const languagesParam = selectedLanguages.length === LANGUAGES.length ? 'ALL' : selectedLanguages.join(',');

            const rawRes = await fetchNewsAction({
                keyword: keyword.trim(),
                countries: countriesParam,
                languages: languagesParam,
                sourceTypes: selectedSourceTypes.join(','),
                dateFrom: dateFrom ? formatDateForBackend(dateFrom) : undefined,
                dateTo: dateTo ? formatDateForBackend(dateTo) : undefined,
            });

            if (signal.aborted) return;

            // Validate API response shape with Zod schema
            const parsed = FetchNewsSchema.safeParse(rawRes);
            if (!parsed.success) {
                console.error("fetchNews response validation failed:", parsed.error);
                setErrorMsg(t('fetch_failed'));
                return;
            }

            const res = parsed.data;
            if (res.success) {
                setResult(res);
            } else {
                if (res.capacityExhausted) {
                    setRetryCountdown(res.retryAfter || 60);
                    setErrorMsg(t('ai_busy_wait', { seconds: res.retryAfter || 60 }));
                } else {
                    setErrorMsg(res.error || t('fetch_failed'));
                }
            }
        } catch (error: unknown) {
            if (signal.aborted) return;
            console.error("News fetch internal error:", error);
            setErrorMsg(t('fetch_failed'));
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, [
        validate,
        authLoading,
        isAuthenticated,
        keyword,
        selectedCountries,
        selectedLanguages,
        selectedSourceTypes,
        dateFrom,
        dateTo,
        fetchNewsAction,
        t,
        formatDateForBackend,
    ]);

    const clearForm = useCallback(() => {
        setKeyword('');
        setOptimizationInfo(null);
        setSelectedCountries(['AE']);
        setSelectedLanguages(isAr ? ['ar', 'en'] : ['en', 'ar']);
        setDateFrom('');
        setDateTo('');
        setSelectedSourceTypes(
            defaultSourceType ? [defaultSourceType] : ['Online News', 'Press Release']
        );
        setResult(null);
        setErrorMsg('');
        setErrors({});
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, [isAr, defaultSourceType]);

    const handleOptimize = useCallback(async () => {
        if (!keyword.trim()) return;
        setIsOptimizing(true);
        try {
            const rawRes = await optimizeSearchAction({
                keyword: keyword.trim(),
                context: 'news',
                targetLanguages: selectedLanguages
            });

            // Validate API response shape with Zod schema
            const parsed = OptimizeQuerySchema.safeParse(rawRes);
            if (!parsed.success) {
                console.error("optimizeQuery response validation failed:", parsed.error);
                return;
            }

            const res = parsed.data;
            if (res && res.optimized) {
                setOptimizationInfo({
                    original: keyword,
                    explanation: res.explanation
                });
                setKeyword(res.optimized);
            }
        } catch (e) {
            console.error("Optimization failed:", e);
        } finally {
            setIsOptimizing(false);
        }
    }, [keyword, selectedLanguages, optimizeSearchAction]);

    return {
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
    };
}
