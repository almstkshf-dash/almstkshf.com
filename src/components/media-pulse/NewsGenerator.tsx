'use client';
import clsx from 'clsx';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Search, Loader2, Sparkles, AlertCircle, AlertTriangle, CheckCircle2, Languages, FileText, Share2, Download, Trash2, Edit3, Plus, Filter, ChevronDown, Check, X, Newspaper, Globe, MessageSquare, Megaphone, TrendingUp, ShieldAlert, BarChart, Settings, Users, ArrowRight, Zap, Target, BookOpen, Clock, Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import Button from "../ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from 'next-intl';

// ═══════════════════════════════════════════════════════════════
// FULL WORLD COUNTRIES LIST
// ═══════════════════════════════════════════════════════════════
export const ALL_COUNTRIES = [
    { code: 'AE', flag: '🇦🇪', en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة' },
    { code: 'SA', flag: '🇸🇦', en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
    { code: 'EG', flag: '🇪🇬', en: 'Egypt', ar: 'مصر' },
    { code: 'KW', flag: '🇰🇼', en: 'Kuwait', ar: 'الكويت' },
    { code: 'QA', flag: '🇶🇦', en: 'Qatar', ar: 'قطر' },
    { code: 'BH', flag: '🇧🇭', en: 'Bahrain', ar: 'البحرين' },
    { code: 'OM', flag: '🇴🇲', en: 'Oman', ar: 'عُمان' },
    { code: 'JO', flag: '🇯🇴', en: 'Jordan', ar: 'الأردن' },
    { code: 'LB', flag: '🇱🇧', en: 'Lebanon', ar: 'لبنان' },
    { code: 'IQ', flag: '🇮🇶', en: 'Iraq', ar: 'العراق' },
    { code: 'SY', flag: '🇸🇾', en: 'Syria', ar: 'سوريا' },
    { code: 'PS', flag: '🇵🇸', en: 'Palestine', ar: 'فلسطين' },
    { code: 'YE', flag: '🇾🇪', en: 'Yemen', ar: 'اليمن' },
    { code: 'LY', flag: '🇱🇾', en: 'Libya', ar: 'ليبيا' },
    { code: 'TN', flag: '🇹🇳', en: 'Tunisia', ar: 'تونس' },
    { code: 'DZ', flag: '🇩🇿', en: 'Algeria', ar: 'الجزائر' },
    { code: 'MA', flag: '🇲🇦', en: 'Morocco', ar: 'المغرب' },
    { code: 'SD', flag: '🇸🇩', en: 'Sudan', ar: 'السودان' },
    { code: 'SO', flag: '🇸🇴', en: 'Somalia', ar: 'الصومال' },
    { code: 'DJ', flag: '🇩🇯', en: 'Djibouti', ar: 'جيبوتي' },
    { code: 'MR', flag: '🇲🇷', en: 'Mauritania', ar: 'موريتانيا' },
    { code: 'KM', flag: '🇰🇲', en: 'Comoros', ar: 'جزر القمر' },
    { code: 'US', flag: '🇺🇸', en: 'United States', ar: 'الولايات المتحدة' },
    { code: 'GB', flag: '🇬🇧', en: 'United Kingdom', ar: 'المملكة المتحدة' },
    { code: 'CA', flag: '🇨🇦', en: 'Canada', ar: 'كندا' },
    { code: 'AU', flag: '🇦🇺', en: 'Australia', ar: 'أستراليا' },
    { code: 'FR', flag: '🇫🇷', en: 'France', ar: 'فرنسا' },
    { code: 'DE', flag: '🇩🇪', en: 'Germany', ar: 'ألمانيا' },
    { code: 'IT', flag: '🇮🇹', en: 'Italy', ar: 'إيطاليا' },
    { code: 'ES', flag: '🇪🇸', en: 'Spain', ar: 'إسبانيا' },
    { code: 'NL', flag: '🇳🇱', en: 'Netherlands', ar: 'هولندا' },
    { code: 'BE', flag: '🇧🇪', en: 'Belgium', ar: 'بلجيكا' },
    { code: 'CH', flag: '🇨🇭', en: 'Switzerland', ar: 'سويسرا' },
    { code: 'AT', flag: '🇦🇹', en: 'Austria', ar: 'النمسا' },
    { code: 'SE', flag: '🇸🇪', en: 'Sweden', ar: 'السويد' },
    { code: 'NO', flag: '🇳🇴', en: 'Norway', ar: 'النرويج' },
    { code: 'DK', flag: '🇩🇰', en: 'Denmark', ar: 'الدنمارك' },
    { code: 'FI', flag: '🇫🇮', en: 'Finland', ar: 'فنلندا' },
    { code: 'PL', flag: '🇵🇱', en: 'Poland', ar: 'بولندا' },
    { code: 'PT', flag: '🇵🇹', en: 'Portugal', ar: 'البرتغال' },
    { code: 'GR', flag: '🇬🇷', en: 'Greece', ar: 'اليونان' },
    { code: 'IE', flag: '🇮🇪', en: 'Ireland', ar: 'أيرلندا' },
    { code: 'CZ', flag: '🇨🇿', en: 'Czech Republic', ar: 'التشيك' },
    { code: 'RO', flag: '🇷🇴', en: 'Romania', ar: 'رومانيا' },
    { code: 'HU', flag: '🇭🇺', en: 'Hungary', ar: 'المجر' },
    { code: 'RU', flag: '🇷🇺', en: 'Russia', ar: 'روسيا' },
    { code: 'TR', flag: '🇹🇷', en: 'Turkey', ar: 'تركيا' },
    { code: 'CN', flag: '🇨🇳', en: 'China', ar: 'الصين' },
    { code: 'JP', flag: '🇯🇵', en: 'Japan', ar: 'اليابان' },
    { code: 'KR', flag: '🇰🇷', en: 'South Korea', ar: 'كوريا الجنوبية' },
    { code: 'IN', flag: '🇮🇳', en: 'India', ar: 'الهند' },
    { code: 'PK', flag: '🇵🇰', en: 'Pakistan', ar: 'باكستان' },
    { code: 'BD', flag: '🇧🇩', en: 'Bangladesh', ar: 'بنغلاديش' },
    { code: 'ID', flag: '🇮🇩', en: 'Indonesia', ar: 'إندونيسيا' },
    { code: 'MY', flag: '🇲🇾', en: 'Malaysia', ar: 'ماليزيا' },
    { code: 'SG', flag: '🇸🇬', en: 'Singapore', ar: 'سنغافورة' },
    { code: 'TH', flag: '🇹🇭', en: 'Thailand', ar: 'تايلاند' },
    { code: 'PH', flag: '🇵🇭', en: 'Philippines', ar: 'الفلبين' },
    { code: 'VN', flag: '🇻🇳', en: 'Vietnam', ar: 'فيتنام' },
    { code: 'BR', flag: '🇧🇷', en: 'Brazil', ar: 'البرازيل' },
    { code: 'MX', flag: '🇲🇽', en: 'Mexico', ar: 'المكسيك' },
    { code: 'AR', flag: '🇦🇷', en: 'Argentina', ar: 'الأرجنتين' },
    { code: 'CO', flag: '🇨🇴', en: 'Colombia', ar: 'كولومبيا' },
    { code: 'CL', flag: '🇨🇱', en: 'Chile', ar: 'تشيلي' },
    { code: 'ZA', flag: '🇿🇦', en: 'South Africa', ar: 'جنوب أفريقيا' },
    { code: 'NG', flag: '🇳🇬', en: 'Nigeria', ar: 'نيجيريا' },
    { code: 'KE', flag: '🇰🇪', en: 'Kenya', ar: 'كينيا' },
    { code: 'GH', flag: '🇬🇭', en: 'Ghana', ar: 'غانا' },
    { code: 'ET', flag: '🇪🇹', en: 'Ethiopia', ar: 'إثيوبيا' },
    { code: 'TZ', flag: '🇹🇿', en: 'Tanzania', ar: 'تنزانيا' },
    { code: 'IL', flag: '🇮🇱', en: 'Israel', ar: 'إسرائيل' },
    { code: 'IR', flag: '🇮🇷', en: 'Iran', ar: 'إيران' },
    { code: 'AF', flag: '🇦🇫', en: 'Afghanistan', ar: 'أفغانستان' },
    { code: 'NZ', flag: '🇳🇿', en: 'New Zealand', ar: 'نيوزيلندا' },
    { code: 'UA', flag: '🇺🇦', en: 'Ukraine', ar: 'أوكرانيا' },
    { code: 'HR', flag: '🇭🇷', en: 'Croatia', ar: 'كرواتيا' },
    { code: 'RS', flag: '🇷🇸', en: 'Serbia', ar: 'صربيا' },
    { code: 'BG', flag: '🇧🇬', en: 'Bulgaria', ar: 'بلغاريا' },
    { code: 'SK', flag: '🇸🇰', en: 'Slovakia', ar: 'سلوفاكيا' },
    { code: 'LT', flag: '🇱🇹', en: 'Lithuania', ar: 'ليتوانيا' },
    { code: 'LV', flag: '🇱🇻', en: 'Latvia', ar: 'لاتفيا' },
    { code: 'EE', flag: '🇪🇪', en: 'Estonia', ar: 'إستونيا' },
    { code: 'CY', flag: '🇨🇾', en: 'Cyprus', ar: 'قبرص' },
    { code: 'MT', flag: '🇲🇹', en: 'Malta', ar: 'مالطا' },
    { code: 'LU', flag: '🇱🇺', en: 'Luxembourg', ar: 'لوكسمبورغ' },
    { code: 'IS', flag: '🇮🇸', en: 'Iceland', ar: 'آيسلندا' },
    { code: 'PE', flag: '🇵🇪', en: 'Peru', ar: 'بيرو' },
    { code: 'VE', flag: '🇻🇪', en: 'Venezuela', ar: 'فنزويلا' },
    { code: 'EC', flag: '🇪🇨', en: 'Ecuador', ar: 'الإكوادور' },
    { code: 'UY', flag: '🇺🇾', en: 'Uruguay', ar: 'أوروغواي' },
    { code: 'PY', flag: '🇵🇾', en: 'Paraguay', ar: 'باراغواي' },
    { code: 'BO', flag: '🇧🇴', en: 'Bolivia', ar: 'بوليفيا' },
    { code: 'CR', flag: '🇨🇷', en: 'Costa Rica', ar: 'كوستاريكا' },
    { code: 'PA', flag: '🇵🇦', en: 'Panama', ar: 'بنما' },
    { code: 'CU', flag: '🇨🇺', en: 'Cuba', ar: 'كوبا' },
    { code: 'DO', flag: '🇩🇴', en: 'Dominican Republic', ar: 'جمهورية الدومينيكان' },
    { code: 'GT', flag: '🇬🇹', en: 'Guatemala', ar: 'غواتيمالا' },
    { code: 'HN', flag: '🇭🇳', en: 'Honduras', ar: 'هندوراس' },
    { code: 'JM', flag: '🇯🇲', en: 'Jamaica', ar: 'جامايكا' },
    { code: 'TT', flag: '🇹🇹', en: 'Trinidad and Tobago', ar: 'ترينيداد وتوباغو' },
    { code: 'HT', flag: '🇭🇹', en: 'Haiti', ar: 'هايتي' },
    { code: 'SV', flag: '🇸🇻', en: 'El Salvador', ar: 'السلفادور' },
    { code: 'NI', flag: '🇳🇮', en: 'Nicaragua', ar: 'نيكاراغوا' },
    { code: 'LK', flag: '🇱🇰', en: 'Sri Lanka', ar: 'سريلانكا' },
    { code: 'MM', flag: '🇲🇲', en: 'Myanmar', ar: 'ميانمار' },
    { code: 'KH', flag: '🇰🇭', en: 'Cambodia', ar: 'كمبوديا' },
    { code: 'NP', flag: '🇳🇵', en: 'Nepal', ar: 'نيبال' },
    { code: 'UZ', flag: '🇺🇿', en: 'Uzbekistan', ar: 'أوزبكستان' },
    { code: 'KZ', flag: '🇰🇿', en: 'Kazakhstan', ar: 'كازاخستان' },
    { code: 'GE', flag: '🇬🇪', en: 'Georgia', ar: 'جورجيا' },
    { code: 'AZ', flag: '🇦🇿', en: 'Azerbaijan', ar: 'أذربيجان' },
    { code: 'AM', flag: '🇦🇲', en: 'Armenia', ar: 'أرمينيا' },
    { code: 'UG', flag: '🇺🇬', en: 'Uganda', ar: 'أوغندا' },
    { code: 'CM', flag: '🇨🇲', en: 'Cameroon', ar: 'الكاميرون' },
    { code: 'SN', flag: '🇸🇳', en: 'Senegal', ar: 'السنغال' },
    { code: 'CI', flag: '🇨🇮', en: 'Ivory Coast', ar: 'ساحل العاج' },
    { code: 'MG', flag: '🇲🇬', en: 'Madagascar', ar: 'مدغشقر' },
    { code: 'MZ', flag: '🇲🇿', en: 'Mozambique', ar: 'موزمبيق' },
    { code: 'AO', flag: '🇦🇴', en: 'Angola', ar: 'أنغولا' },
    { code: 'TW', flag: '🇹🇼', en: 'Taiwan', ar: 'تايوان' },
    { code: 'HK', flag: '🇭🇰', en: 'Hong Kong', ar: 'هونغ كونغ' },
    { code: 'MO', flag: '🇲🇴', en: 'Macau', ar: 'ماكاو' },
    { code: 'BN', flag: '🇧🇳', en: 'Brunei', ar: 'بروناي' },
];

const LANGUAGES = [
    { code: 'en', en: 'English', ar: 'الإنجليزية' },
    { code: 'ar', en: 'Arabic', ar: 'العربية' },
    { code: 'fr', en: 'French', ar: 'الفرنسية' },
    { code: 'de', en: 'German', ar: 'الألمانية' },
    { code: 'es', en: 'Spanish', ar: 'الإسبانية' },
    { code: 'pt', en: 'Portuguese', ar: 'البرتغالية' },
    { code: 'ru', en: 'Russian', ar: 'الروسية' },
    { code: 'zh', en: 'Chinese', ar: 'الصينية' },
    { code: 'ja', en: 'Japanese', ar: 'اليابانية' },
    { code: 'ko', en: 'Korean', ar: 'الكورية' },
    { code: 'hi', en: 'Hindi', ar: 'الهندية' },
    { code: 'tr', en: 'Turkish', ar: 'التركية' },
    { code: 'id', en: 'Indonesian', ar: 'الإندونيسية' },
    { code: 'ur', en: 'Urdu', ar: 'الأردية' },
];

// ═══════════════════════════════════════════════════════════════
// SEARCHABLE MULTI-SELECT DROPDOWN COMPONENT
// ═══════════════════════════════════════════════════════════════
function MultiSelectDropdown({
    items,
    selected,
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
    items: { id: string; label: string; searchStr: string }[];
    selected: string[];
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
    const defaultRenderItem = (item: { id: string; label: string }) => <span>{item.label}</span>;
    const defaultRenderTag = (id: string) => {
        const item = items.find(i => i.id === id);
        return <span>{item?.label || id}</span>;
    };

    const finalRenderItem = renderItem || defaultRenderItem;
    const finalRenderTag = renderTag || defaultRenderTag;
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = items.filter(
        (item) => search.length === 0 || item.searchStr.toLowerCase().includes(search.toLowerCase())
    );

    const toggle = (id: string) => {
        onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    };

    return (
        <div ref={ref} className="relative">
            {/* Trigger Button */}
            <div
                role="button"
                tabIndex={0}
                aria-labelledby={ariaLabelledBy}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
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
                        <span className="text-muted-foreground text-sm transition-colors">{placeholder}</span>
                    ) : (
                        selected.map((id) => (
                            <span
                                key={id}
                                className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 rounded-lg px-2 py-0.5 text-xs font-bold transition-colors"
                            >
                                {finalRenderTag(id)}
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => { e.stopPropagation(); toggle(id); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggle(id); } }}
                                    className="hover:text-primary/70 ml-0.5 cursor-pointer transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </span>
                            </span>
                        ))
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-all flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-1.5 text-xs text-destructive flex items-center gap-1 animate-in fade-in duration-300">
                    <AlertTriangle className="w-3 h-3" /> {error}
                </p>
            )}

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute z-[90] mt-2 w-full bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 ring-1 ring-black/5">
                    {/* Search */}
                    <div className="p-3 border-b border-border/50 bg-muted/20">
                        <div className="relative">
                            <label htmlFor={`${id || 'dropdown'}-search`} className="sr-only">{searchPlaceholder}</label>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
                            <input
                                id={`${id || 'dropdown'}-search`}
                                name={`${id || 'dropdown'}-search`}
                                type="text"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-background/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 border border-border transition-all shadow-sm"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="max-h-64 overflow-y-auto scrollbar-thin transition-colors">
                        {filtered.length === 0 ? (
                            <div className="py-10 text-center">
                                <Search className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                                <p className="text-muted-foreground text-xs font-medium">{noResultsText || 'No results found'}</p>
                            </div>
                        ) : (
                            <div className="p-1.5 grid grid-cols-1 gap-0.5">
                                {filtered.map((item) => (
                                    <Button
                                        key={item.id}
                                        variant="ghost"
                                        onClick={() => toggle(item.id)}
                                        className={clsx(
                                            "w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm rounded-lg transition-all h-auto shadow-none",
                                            selected.includes(item.id)
                                                ? 'bg-primary/10 text-primary font-semibold'
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
                                                <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground stroke-[3]" />
                                            )}
                                        </div>
                                        <div className="flex-1 truncate">{finalRenderItem(item)}</div>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-border/50 bg-muted/10 flex items-center justify-between transition-colors">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest transition-colors px-2">
                            {selected.length} {selectedText || 'selected'}
                        </span>
                        {selected.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onChange([])}
                                className="text-[10px] text-primary hover:text-primary/70 uppercase tracking-widest font-black transition-colors px-2 py-1 rounded-lg hover:bg-primary/5 h-auto shadow-none"
                            >
                                {clearAllText || 'Clear All'}
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAIN NEWS GENERATOR
// ═══════════════════════════════════════════════════════════════
export default function NewsGenerator() {
    const locale = useLocale();
    const t = useTranslations('NewsGenerator');
    const isAr = locale === 'ar';

    const fetchNews = useAction(api.monitoringAction.fetchNews);

    const [keyword, setKeyword] = useState('');
    const [selectedCountries, setSelectedCountries] = useState<string[]>(['AE']);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(isAr ? ['ar', 'en'] : ['en', 'ar']);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedSourceTypes, setSelectedSourceTypes] = useState<string[]>(['Online News', 'Press Release']);
    const [loading, setLoading] = useState(false);

    const sourceTypes = [
        { id: 'Online News', label: isAr ? 'أخبار عبر الإنترنت' : 'Online News', searchStr: 'Online News أخبار عبر الإنترنت' },
        { id: 'Press Release', label: isAr ? 'بيان صحفي' : 'Press Release', searchStr: 'Press Release بيان صحفي' },
        { id: 'Blog', label: isAr ? 'مدونة' : 'Blog', searchStr: 'Blog مدونة' },
        { id: 'Social Media', label: isAr ? 'وسائل التواصل الاجتماعي' : 'Social Media', searchStr: 'Social Media وسائل التواصل الاجتماعي' },
        { id: 'Print', label: isAr ? 'صحافة مطبوعة' : 'Print', searchStr: 'Print صحافة مطبوعة' },
    ];
    const [result, setResult] = useState<{ count: number; skipped: number; feeds: number } | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    // Validation errors
    const [errors, setErrors] = useState<{ keyword?: string; countries?: string; languages?: string }>({});

    // Date picker dropdown
    const [showDatePicker, setShowDatePicker] = useState(false);
    const dateRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDatePicker(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Convert HTML date (YYYY-MM-DD) → DD/MM/YYYY for backend
    const formatDateForBackend = (htmlDate: string): string => {
        if (!htmlDate) return '';
        const [y, m, d] = htmlDate.split('-');
        return `${d}/${m}/${y}`;
    };

    const formatDateDisplay = (htmlDate: string): string => {
        if (!htmlDate) return '';
        const d = new Date(htmlDate);
        return d.toLocaleDateString(locale === 'ar' ? 'ar-AE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Country helpers
    const countryItems = ALL_COUNTRIES.map((c) => ({
        id: c.code,
        label: isAr ? c.ar : c.en,
        searchStr: `${c.en} ${c.ar} ${c.code}`,
    }));

    const getCountryByCode = useCallback((code: string) => ALL_COUNTRIES.find((c) => c.code === code), []);

    // Language helpers
    const languageItems = LANGUAGES.map((l) => ({
        id: l.code,
        label: isAr ? l.ar : l.en,
        searchStr: `${l.en} ${l.ar} ${l.code}`,
    }));

    const getLangByCode = useCallback((code: string) => LANGUAGES.find((l) => l.code === code), []);

    const validate = (): boolean => {
        const newErrors: typeof errors = {};
        if (!keyword.trim()) newErrors.keyword = t('error_keyword_required');
        if (selectedCountries.length === 0) newErrors.countries = t('error_country_required');
        if (selectedLanguages.length === 0) newErrors.languages = t('error_language_required');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleGenerate = async () => {
        if (!validate()) return;
        setLoading(true);
        setResult(null);
        setErrorMsg('');
        try {
            const res = await fetchNews({
                keyword: keyword.trim(),
                countries: selectedCountries.join(','),
                languages: selectedLanguages.join(','),
                sourceTypes: selectedSourceTypes.join(','),
                dateFrom: dateFrom ? formatDateForBackend(dateFrom) : undefined,
                dateTo: dateTo ? formatDateForBackend(dateTo) : undefined,
            }) as any;

            if (res.success) {
                setResult(res);
            } else {
                setErrorMsg(res.error || t('fetch_failed'));
            }
        } catch (error: any) {
            console.error("News fetch internal error:", error);
            setErrorMsg(t('fetch_failed'));
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setKeyword('');
        setSelectedCountries(['AE']);
        setSelectedLanguages(isAr ? ['ar', 'en'] : ['en', 'ar']);
        setDateFrom('');
        setDateTo('');
        setResult(null);
        setErrorMsg('');
        setErrors({});
    };

    return (
        <section className="relative z-20 bg-card border border-border rounded-2xl overflow-visible backdrop-blur-sm shadow-sm transition-all">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center transition-colors">
                        <Search className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-foreground font-bold text-sm transition-colors">{t('monitor_keyword')}</h3>
                        <p className="text-muted-foreground text-[11px] transition-colors">{t('subtitle')}</p>
                    </div>
                </div>
                {(keyword || result || errorMsg) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearForm}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 border border-border rounded-lg px-3 py-1.5 hover:bg-muted/50 h-auto shadow-none"
                    >
                        <X className="w-3 h-3" />
                        {t('clear')}
                    </Button>
                )}
            </div>

            <div className="p-6 space-y-6">
                {/* Keyword Input */}
                <div>
                    <label htmlFor="monitor_keyword" className="sr-only">{t('monitor_keyword')}</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            id="monitor_keyword"
                            name="monitor_keyword"
                            type="text"
                            placeholder={t('placeholder')}
                            value={keyword}
                            onChange={(e) => { setKeyword(e.target.value); setErrors(prev => ({ ...prev, keyword: undefined })); }}
                            className={`w-full bg-muted/50 rounded-xl pl-11 pr-4 py-3.5 text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground border ${errors.keyword ? 'border-destructive/60 ring-2 ring-destructive/20' : 'border-border'
                                }`}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Countries */}
                    <div className="space-y-2">
                        <span className="block text-[11px] text-muted-foreground font-bold uppercase tracking-widest transition-colors px-1">{t('region')}</span>
                        <MultiSelectDropdown
                            items={countryItems}
                            selected={selectedCountries}
                            onChange={(v) => setSelectedCountries(v)}
                            placeholder={t('select_countries')}
                            searchPlaceholder={t('search_countries')}
                            selectedText={t('selected')}
                            icon={<Globe className="w-4 h-4" />}
                            renderItem={(item) => (
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{getCountryByCode(item.id)?.flag}</span>
                                    <span>{item.label}</span>
                                </div>
                            )}
                            renderTag={(id) => (
                                <div className="flex items-center gap-1.5">
                                    <span>{getCountryByCode(id)?.flag}</span>
                                    <span>{id}</span>
                                </div>
                            )}
                        />
                    </div>

                    {/* Languages */}
                    <div className="space-y-2">
                        <span className="block text-[11px] text-muted-foreground font-bold uppercase tracking-widest transition-colors px-1">{t('language')}</span>
                        <MultiSelectDropdown
                            items={languageItems}
                            selected={selectedLanguages}
                            onChange={(v) => setSelectedLanguages(v)}
                            placeholder={t('select_languages')}
                            searchPlaceholder={t('search_languages')}
                            selectedText={t('selected')}
                            icon={<Languages className="w-4 h-4" />}
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
                    </div>

                    {/* Source Types */}
                    <div className="space-y-2">
                        <span className="block text-[11px] text-muted-foreground font-bold uppercase tracking-widest transition-colors px-1">{t('source_types') || 'Source Types'}</span>
                        <MultiSelectDropdown
                            items={sourceTypes}
                            selected={selectedSourceTypes}
                            onChange={(v) => setSelectedSourceTypes(v)}
                            placeholder={t('select_sources') || 'Select sources...'}
                            searchPlaceholder={t('search_sources') || 'Search sources...'}
                            selectedText={t('sources_selected') || 'selected'}
                            icon={<Filter className="w-4 h-4" />}
                        />
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                        <span className="block text-[11px] text-muted-foreground font-bold uppercase tracking-widest transition-colors px-1">{t('date_range')}</span>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full bg-muted/50 border border-border rounded-xl px-2 py-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full bg-muted/50 border border-border rounded-xl px-2 py-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                        {errorMsg && (
                            <div className="text-destructive text-xs flex items-center gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {errorMsg}
                            </div>
                        )}
                        {result && (
                            <div className="text-emerald-500 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {t('result_success', { count: result.count, skipped: result.skipped, feeds: result.feeds })}
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleGenerate}
                        isLoading={loading}
                        className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground font-bold px-10 py-3.5 rounded-xl transition-all shadow-xl shadow-primary/20 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-sm whitespace-nowrap"
                    >
                        {loading ? (
                            t('analyzing')
                        ) : (
                            <>🚀 {t('generate_report')}</>
                        )}
                    </Button>
                </div>
            </div>
        </section>
    );
}
