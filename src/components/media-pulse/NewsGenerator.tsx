'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Search, Loader2, Globe, Languages, Calendar, CheckCircle2, ChevronDown, X, AlertTriangle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

// ═══════════════════════════════════════════════════════════════
// FULL WORLD COUNTRIES LIST
// ═══════════════════════════════════════════════════════════════
const ALL_COUNTRIES = [
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
}: {
    items: { id: string; label: string; searchStr: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder: string;
    searchPlaceholder: string;
    renderItem: (item: { id: string; label: string }) => React.ReactNode;
    renderTag: (id: string) => React.ReactNode;
    icon: React.ReactNode;
    error?: string;
    noResultsText?: string;
    selectedText?: string;
    clearAllText?: string;
    "aria-labelledby"?: string;
}) {
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
                className={`w-full flex items-center gap-2 bg-slate-900/80 rounded-xl px-4 py-3 text-left transition-all border cursor-pointer ${error
                    ? 'border-rose-500/60 ring-2 ring-rose-500/20'
                    : isOpen
                        ? 'border-amber-500/50 ring-2 ring-amber-500/20'
                        : 'border-slate-700/60 hover:border-slate-600'
                    }`}
            >
                <span className="text-slate-500 flex-shrink-0">{icon}</span>
                <div className="flex-1 flex flex-wrap gap-1.5 min-h-[24px]">
                    {selected.length === 0 ? (
                        <span className="text-slate-500 text-sm">{placeholder}</span>
                    ) : (
                        selected.map((id) => (
                            <span
                                key={id}
                                className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-lg px-2 py-0.5 text-xs font-medium"
                            >
                                {renderTag(id)}
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => { e.stopPropagation(); toggle(id); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggle(id); } }}
                                    className="hover:text-amber-100 ml-0.5 cursor-pointer"
                                >
                                    <X className="w-3 h-3" />
                                </span>
                            </span>
                        ))
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {error}
                </p>
            )}

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Search */}
                    <div className="p-2 border-b border-slate-800">
                        <div className="relative">
                            <label htmlFor="dropdown-search" className="sr-only">{searchPlaceholder}</label>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                            <input
                                id="dropdown-search"
                                name="dropdown-search"
                                type="text"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-slate-800/80 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-amber-500/30 border border-slate-700/50"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="max-h-56 overflow-y-auto scrollbar-thin">
                        {filtered.length === 0 ? (
                            <div className="py-6 text-center text-slate-500 text-sm">{noResultsText || 'No results found'}</div>
                        ) : (
                            filtered.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => toggle(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${selected.includes(item.id)
                                        ? 'bg-amber-500/10 text-amber-200'
                                        : 'text-slate-300 hover:bg-slate-800/80'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selected.includes(item.id)
                                        ? 'bg-amber-500 border-amber-500'
                                        : 'border-slate-600'
                                        }`}>
                                        {selected.includes(item.id) && (
                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                        )}
                                    </div>
                                    {renderItem(item)}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                            {selected.length} {selectedText || 'selected'}
                        </span>
                        {selected.length > 0 && (
                            <button
                                type="button"
                                onClick={() => onChange([])}
                                className="text-[10px] text-rose-400 hover:text-rose-300 uppercase tracking-wider font-bold"
                            >
                                {clearAllText || 'Clear All'}
                            </button>
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
    const [loading, setLoading] = useState(false);
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
                dateFrom: dateFrom ? formatDateForBackend(dateFrom) : undefined,
                dateTo: dateTo ? formatDateForBackend(dateTo) : undefined,
            });
            setResult(res as any);
        } catch (error: any) {
            console.error(error);
            setErrorMsg(error?.message || t('fetch_failed'));
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
        <section className="relative z-20 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/40 rounded-2xl overflow-visible backdrop-blur-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-700/40 flex items-center justify-between bg-slate-900/40">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                        <Search className="w-4.5 h-4.5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">{t('monitor_keyword')}</h3>
                        <p className="text-slate-500 text-[11px]">{t('subtitle')}</p>
                    </div>
                </div>
                {(keyword || result || errorMsg) && (
                    <button onClick={clearForm} className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 border border-slate-700/50 rounded-lg px-3 py-1.5 hover:bg-slate-800/50">
                        <X className="w-3 h-3" />
                        {t('clear')}
                    </button>
                )}
            </div>

            <div className="p-6 space-y-5">
                {/* Keyword Input */}
                <div>
                    <label htmlFor="monitor_keyword" className="sr-only">{t('monitor_keyword')}</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            id="monitor_keyword"
                            name="monitor_keyword"
                            type="text"
                            placeholder={t('placeholder')}
                            value={keyword}
                            onChange={(e) => { setKeyword(e.target.value); setErrors(prev => ({ ...prev, keyword: undefined })); }}
                            className={`w-full bg-slate-900/80 rounded-xl pl-11 pr-4 py-3.5 text-white text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-600 border ${errors.keyword ? 'border-rose-500/60 ring-2 ring-rose-500/20' : 'border-slate-700/60'
                                }`}
                        />
                    </div>
                    {errors.keyword && (
                        <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> {errors.keyword}
                        </p>
                    )}
                </div>

                {/* Countries & Languages Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Countries Dropdown */}
                    <div>
                        <label id="region-label" className="block text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">{t('region')}</label>
                        <MultiSelectDropdown
                            aria-labelledby="region-label"
                            items={countryItems}
                            selected={selectedCountries}
                            onChange={(v) => { setSelectedCountries(v); setErrors(prev => ({ ...prev, countries: undefined })); }}
                            placeholder={t('select_countries')}
                            searchPlaceholder={t('search_countries')}
                            icon={<Globe className="w-4 h-4" />}
                            error={errors.countries}
                            noResultsText={t('no_results')}
                            selectedText={t('selected')}
                            clearAllText={t('clear_all')}
                            renderItem={(item) => {
                                const c = getCountryByCode(item.id);
                                return <span>{c?.flag} {item.label}</span>;
                            }}
                            renderTag={(id) => {
                                const c = getCountryByCode(id);
                                return <>{c?.flag} {c?.code}</>;
                            }}
                        />
                    </div>

                    {/* Languages Dropdown */}
                    <div>
                        <label id="language-label" className="block text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">{t('language')}</label>
                        <MultiSelectDropdown
                            aria-labelledby="language-label"
                            items={languageItems}
                            selected={selectedLanguages}
                            onChange={(v) => { setSelectedLanguages(v); setErrors(prev => ({ ...prev, languages: undefined })); }}
                            placeholder={t('select_languages')}
                            searchPlaceholder={t('search_languages')}
                            icon={<Languages className="w-4 h-4" />}
                            noResultsText={t('no_results')}
                            selectedText={t('selected')}
                            clearAllText={t('clear_all')}
                            renderItem={(item) => <span>{item.label}</span>}
                            renderTag={(id) => {
                                const l = getLangByCode(id);
                                return <>{isAr ? l?.ar : l?.en}</>;
                            }}
                        />
                    </div>
                </div>

                {/* Date Range + Action Row */}
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    {/* Date Range Popup */}
                    <div className="flex-1" ref={dateRef}>
                        <label className="block text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">{t('date_range')}</label>
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowDatePicker(!showDatePicker); } }}
                            className="w-full flex items-center gap-2 bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-left hover:border-slate-600 transition-all cursor-pointer"
                        >
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span className={`text-sm ${dateFrom || dateTo ? 'text-white' : 'text-slate-500'}`}>
                                {dateFrom || dateTo
                                    ? `${dateFrom ? formatDateDisplay(dateFrom) : '...'} — ${dateTo ? formatDateDisplay(dateTo) : '...'}`
                                    : t('select_dates')
                                }
                            </span>
                            {(dateFrom || dateTo) && (
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => { e.stopPropagation(); setDateFrom(''); setDateTo(''); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setDateFrom(''); setDateTo(''); } }}
                                    className="ml-auto text-slate-500 hover:text-slate-300 cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </span>
                            )}
                        </div>

                        {/* Date Picker Panel */}
                        {showDatePicker && (
                            <div className="absolute z-50 mt-2 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl shadow-black/40 p-4 space-y-4 w-80 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="date_from" className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">{t('date_from')}</label>
                                        <input
                                            id="date_from"
                                            name="date_from"
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-amber-500/30 [color-scheme:dark]"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="date_to" className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">{t('date_to')}</label>
                                        <input
                                            id="date_to"
                                            name="date_to"
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-amber-500/30 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowDatePicker(false)}
                                        className="text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 px-4 py-1.5 rounded-lg hover:bg-amber-500/25 transition-colors font-bold"
                                    >
                                        {t('apply')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-amber-900/20 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-sm whitespace-nowrap"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> {t('analyzing')}</>
                        ) : (
                            <>🚀 {t('generate_report')}</>
                        )}
                    </button>
                </div>

                {/* Error Message */}
                {errorMsg && (
                    <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-3.5 flex items-start gap-3 animate-in fade-in duration-300">
                        <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-rose-300 text-sm font-medium">{t('error_title')}</p>
                            <p className="text-rose-400/80 text-xs mt-0.5">{errorMsg}</p>
                        </div>
                        <button onClick={() => setErrorMsg('')} className="ml-auto text-rose-500 hover:text-rose-300">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Success Result */}
                {result && (
                    <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3.5 flex items-center gap-3 animate-in fade-in duration-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <span className="text-emerald-300 text-sm font-medium">
                            {t('result_success', { count: result.count, skipped: result.skipped, feeds: result.feeds })}
                        </span>
                        <button onClick={() => setResult(null)} className="ml-auto text-emerald-500 hover:text-emerald-300">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
