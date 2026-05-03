'use client';
import clsx from 'clsx';
import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, AlertTriangle, CheckCircle2, ChevronDown, X } from "lucide-react";
import Button from "./Button";
import { useTranslations } from 'next-intl';

// ══════════════════════════════════════════════════════════════════════════════
// SEARCHABLE MULTI-SELECT DROPDOWN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export const MultiSelectDropdown = React.memo(function MultiSelectDropdown({
    items = [],
    selected = [],
    onChange,
    placeholder,
    searchPlaceholder,
    renderItem,
    renderTag,
    icon,
    error,
    noResultsText,
    selectedText,
    clearAllText,
    "aria-labelledby": ariaLabelledBy,
    id,
}: {
    items?: { id: string; label: string; searchStr: string }[];
    selected?: string[];
    onChange: (selected: string[]) => void;
    placeholder: string;
    searchPlaceholder: string;
    renderItem?: (item: { id: string; label: string }) => React.ReactNode;
    renderTag?: (id: string) => React.ReactNode;
    icon?: React.ReactNode;
    error?: string;
    noResultsText?: string;
    selectedText?: string;
    clearAllText?: string;
    "aria-labelledby"?: string;
    id?: string;
}) {
    const defaultRenderItem = useCallback((item: { id: string; label: string }) => <span>{item.label}</span>, []);
    const defaultRenderTag = useCallback((id: string) => {
        const item = items.find(i => i.id === id);
        return <span>{item?.label || id}</span>;
    }, [items]);

    const t = useTranslations('NewsGenerator');
    const finalRenderItem = renderItem || defaultRenderItem;
    const finalRenderTag = renderTag || defaultRenderTag;
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const ariaLabelledById = ariaLabelledBy?.trim() || undefined;
    const comboboxLabelProps = ariaLabelledById
        ? { 'aria-labelledby': ariaLabelledById }
        : { 'aria-label': placeholder };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = React.useMemo(() => {
        return (items || []).filter(
            (item) => search.length === 0 || item.searchStr.toLowerCase().includes(search.toLowerCase())
        );
    }, [items, search]);

    const toggle = useCallback((id_to_toggle: string) => {
        onChange(selected.includes(id_to_toggle) ? selected.filter((s) => s !== id_to_toggle) : [...selected, id_to_toggle]);
    }, [selected, onChange]);

    return (
        <div ref={ref} className="relative">
            {/* Trigger Button */}
            <div
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={`${id || 'dropdown'}-listbox`}
                {...comboboxLabelProps}
                tabIndex={0}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    }
                    if (e.key === 'Escape' && isOpen) {
                        setIsOpen(false);
                    }
                }}
                className={`w-full flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3 text-left transition-all border cursor-pointer ${error
                    ? 'border-destructive/60 ring-2 ring-destructive/20'
                    : isOpen
                        ? 'border-primary/50 ring-2 ring-primary/20 bg-card'
                        : 'border-border hover:border-primary/40'
                    }`}
            >
                {icon && <span className="text-muted-foreground transition-colors flex-shrink-0">{icon}</span>}
                <div className="flex-1 flex flex-wrap gap-1.5 min-h-[24px]">
                    {selected.length === 0 ? (
                        <span className="text-foreground/60 text-sm transition-colors">{placeholder}</span>
                    ) : (
                        selected.map((selected_id) => (
                            <span
                                key={selected_id}
                                className="inline-flex items-center gap-1 bg-primary/15 text-primary-foreground border border-primary/20 rounded-lg px-2 py-0.5 text-xs font-bold transition-colors"
                            >
                                {finalRenderTag(selected_id)}
                                <button
                                    type="button"
                                    aria-label={`${t('remove')} ${items.find(i => i.id === selected_id)?.label || selected_id}`}
                                    onClick={(e) => { e.stopPropagation(); toggle(selected_id); }}
                                    className="hover:text-primary/70 ml-0.5 cursor-pointer transition-colors"
                                >
                                    <X className="w-3 h-3" aria-hidden="true" />
                                </button>
                            </span>
                        ))
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-foreground/70 transition-all flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-1.5 text-xs text-destructive flex items-center gap-1 animate-in fade-in duration-300">
                    <AlertTriangle className="w-3 h-3" aria-hidden="true" /> {error}
                </p>
            )}

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute z-[90] mt-2 w-full bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 ring-1 ring-black/5">
                    {/* Search */}
                    <div className="p-3 border-b border-border/50 bg-muted/20">
                        <div className="relative">
                            <label htmlFor={`${id || 'dropdown'}-search`} className="sr-only">{searchPlaceholder}</label>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" aria-hidden="true" />
                            <input
                                id={`${id || 'dropdown'}-search`}
                                name={`${id || 'dropdown'}-search`}
                                type="text"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoComplete="off"
                                className="w-full bg-background/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:ring-2 focus:ring-primary/20 border border-border transition-all shadow-sm"
                                /* eslint-disable-next-line jsx-a11y/no-autofocus */
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Items List */}
                    <div
                        id={`${id || 'dropdown'}-listbox`}
                        role="listbox"
                        aria-multiselectable="true"
                        className="max-h-64 overflow-y-auto scrollbar-thin transition-colors"
                    >
                        {filtered.length === 0 ? (
                            <div className="py-10 text-center" role="option" aria-disabled="true">
                                <Search className="w-8 h-8 text-foreground/20 mx-auto mb-2" aria-hidden="true" />
                                <p className="text-foreground/60 text-xs font-medium">{noResultsText}</p>
                            </div>
                        ) : (
                            <div className="p-1.5 grid grid-cols-1 gap-0.5">
                                {filtered.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        role="option"
                                        aria-selected={selected.includes(item.id)}
                                        onClick={() => toggle(item.id)}
                                        className={clsx(
                                            "w-full flex justify-start items-center gap-3 px-3 py-2.5 text-sm rounded-lg shadow-none h-auto transition-colors focus:bg-muted focus:outline-none",
                                            selected.includes(item.id)
                                                ? 'bg-primary/10 text-primary-foreground font-semibold'
                                                : 'text-foreground hover:bg-muted font-medium'
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all",
                                            selected.includes(item.id)
                                                ? 'bg-primary border-primary shadow-lg shadow-primary/20'
                                                : 'border-border bg-background'
                                        )}>
                                            {selected.includes(item.id) && (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground stroke-[3]" aria-hidden="true" />
                                            )}
                                        </div>
                                        <div className="flex-1 truncate text-left">{finalRenderItem(item)}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-border/50 bg-muted/10 flex items-center justify-between transition-colors">
                        <span className="text-[10px] text-foreground/70 font-bold uppercase tracking-widest transition-colors px-2">
                            {selected.length} {selectedText}
                        </span>
                        {selected.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onChange([])}
                                className="text-[10px] text-primary hover:text-primary/70 uppercase tracking-widest font-black px-2 py-1 rounded-lg hover:bg-primary/5 h-auto shadow-none"
                            >
                                {clearAllText}
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});
