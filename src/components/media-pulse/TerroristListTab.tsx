'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, Shield, AlertTriangle, User, Users, Building2,
  FileText, Upload, Trash2, Clock, CheckCircle2, XCircle,
  ExternalLink, Info, Filter, Download, ChevronDown, ChevronUp, X
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import * as XLSX from 'xlsx';
import { ReportGenerator } from '@/lib/report-generator';


// ─── Constants ─────────────────────────────────────────────────────────
const ENTRY_TYPES = ['all', 'individual', 'entity', 'organization'] as const;
type EntryType = (typeof ENTRY_TYPES)[number];

export default function TerroristListTab() {
  const { isAuthenticated } = useConvexAuth();
  const t = useTranslations('TerroristList');
  const tCommon = useTranslations('Common');
  const isAdmin = useQuery(api.authQueries.checkIsAdmin);

  // ─── State ────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<EntryType>('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importError, setImportError] = useState<string | null>(null);

  // Keyboard: close modal on Escape
  const handleImportModalKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !importLoading) setIsImportModalOpen(false);
  }, [importLoading]);

  useEffect(() => {
    if (!isImportModalOpen) return;
    document.addEventListener('keydown', handleImportModalKeyDown);
    return () => document.removeEventListener('keydown', handleImportModalKeyDown);
  }, [isImportModalOpen, handleImportModalKeyDown]);

  // ─── Convex Operations ────────────────────────────────────────────────
  const entries = useQuery(api.terroristList.search, {
    searchTerm: searchQuery,
    type: filterType === 'all' ? undefined : filterType
  });

  const wipeAll = useMutation(api.terroristList.wipeAll);
  const addItems = useMutation(api.terroristList.addItems);
  const messages = useTranslations(); // For passing to ReportGenerator if needed, but we'll use t scopes

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!entries || entries.length === 0) return;
    try {
      // Create a simplified translations object for ReportGenerator
      const exportTranslations = {
        TerroristList: {
          title: t('title'),
          fields: {
            name_arabic: t('fields.name_arabic'),
            name_latin: t('fields.name_latin'),
            nationality: t('fields.nationality'),
            doc_number: t('fields.doc_number'),
            category: t('fields.category'),
            reasons: t('fields.reasons')
          }
        },
        Reports: {
          generated_at: tCommon('status') // Or a more appropriate key if available
        }
      };

      await ReportGenerator.exportTerroristListReport(entries, exportTranslations, format);
    } catch (err) {
      console.error('Watchlist export failed:', err);
    }
  };

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isAdmin) return;

    setImportLoading(true);
    setImportProgress({ current: 0, total: 0 });
    setImportError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const data = evt.target?.result;
          const wb = XLSX.read(data, { type: 'array' });

          let allData: any[] = [];

          // Process all sheets
          wb.SheetNames.forEach(sheetName => {
            const worksheet = wb.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

            const mapped = data.map((row: any) => {
              // Robust helper to find values by checking common variations of keys
              const getVal = (valKeys: string[]) => {
                const rowKeys = Object.keys(row);
                for (const key of valKeys) {
                  const foundKey = rowKeys.find(rk => {
                    const normalizedRowKey = rk.trim().toLowerCase().replace(/\s+/g, ' ');
                    const normalizedSearchKey = key.toLowerCase().replace(/\s+/g, ' ');
                    return normalizedRowKey === normalizedSearchKey ||
                      normalizedRowKey.includes(normalizedSearchKey);
                  });
                  if (foundKey && String(row[foundKey]).trim()) return String(row[foundKey]).trim();
                }
                return "";
              };

              const nameAr = getVal(['الاسم كامل', 'الاسم الكامل', 'اسم الفرد', 'اسم الشخص', 'اسم الكيان', 'الاسم بالكامل', 'الاسم', 'Name Arabic', 'Name (Arabic)', 'Full Name Arabic', 'Ar Name']);
              const nameEn = getVal(['الاسم باللاتينية', 'الاسم باللغة الانجليزية', 'الاسم بالانجليزية', 'English Name', 'Name (English)', 'Latin Name', 'Full Name', 'Name Latin', 'Name (Latin)', 'Name English', 'En Name']);
              const typeRaw = getVal(['النوع', 'فئة المدرج', 'Type', 'Category', 'Classification']).toLowerCase();

              return {
                nameArabic: nameAr,
                nameLatin: nameEn,
                type: typeRaw.includes('فرد') || typeRaw.includes('individual') || typeRaw.includes('person') ? 'individual' :
                  typeRaw.includes('كيان') || typeRaw.includes('entity') || typeRaw.includes('company') ? 'entity' :
                    typeRaw.includes('منظمة') || typeRaw.includes('org') || typeRaw.includes('organization') ? 'organization' : 'individual',
                nationality: getVal(['الجنسية', 'الدولة', 'الوطن', 'Nationality', 'Citizen', 'Country', 'State']),
                category: getVal(['الفئة', 'المدرج', 'الحالة', 'Category', 'Status', 'Description', 'List Name']) || 'Designated',
                documentNumber: getVal(['رقم الوثيقة', 'رقم الجواز', 'رقم الهوية', 'الرقم المدني', 'Document Number', 'ID', 'Passport', 'Identifiier', 'Doc #']),
                reasons: getVal(['الأسباب', 'سبب الإدراج', 'الأسس القانونية', 'التفاصيل', 'Reasons', 'Comments', 'Legal Grounds', 'Basis', 'Summary', 'أسباب الإدراج']),
                dob: getVal(['تاريخ الميلاد', 'تاريخ الميلاد/التأسيس', 'سنة الميلاد', 'DOB', 'Date of Birth', 'Birth Date']),
                pob: getVal(['مكان الميلاد', 'بلد المنشأ', 'POB', 'Place of Birth', 'Address of Birth']),
                address: getVal(['العنوان', 'المكان', 'مقر الإقامة', 'Address', 'Location', 'Residence']),
                issuingAuthority: getVal(['جهة الإصدار', 'المصدر', 'الجهة المختصة', 'Issuing Authority', 'Issuer', 'Authority']),
                issueDate: getVal(['تاريخ الإصدار', 'تاريخ القرار', 'Issue Date', 'Decision Date']),
                expiryDate: getVal(['تاريخ الانتهاء', 'تاريخ النفاذ حتى', 'Expiry Date', 'Expiration', 'Valid To']),
                otherInfo: getVal(['معلومات أخرى', 'ملاحظات', 'الكنية', 'بيانات إضافية', 'Other Info', 'Notes', 'Remarks', 'الكيانات المرفوعة', 'Metadata', 'Nickname', 'Alias']),
              };
            });

            // Filter out empty rows
            const validRows = mapped.filter(r => r.nameArabic || r.nameLatin);
            allData = [...allData, ...validRows];
          });

          if (allData.length === 0) {
            throw new Error("No valid data found in sheets");
          }

          // Trigger Convex Mutation
          await wipeAll({});

          const totalChunks = Math.ceil(allData.length / 200);
          setImportProgress({ current: 0, total: totalChunks });

          // Chunk the data to avoid size limits
          const chunkSize = 200;
          for (let i = 0; i < allData.length; i += chunkSize) {
            const chunk = allData.slice(i, i + chunkSize);
            await addItems({ items: chunk });
            setImportProgress(prev => ({ ...prev, current: prev.current + 1 }));
          }

          setIsImportModalOpen(false);
          alert(`Successfully imported ${allData.length} records.`);
        } catch (err: any) {
          setImportError(err.message || "Failed to parse file");
        } finally {
          setImportLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      setImportError("File read error");
      setImportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header & Controls ─── */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">{t('title')}</h2>
              <p className="text-xs text-muted-foreground font-medium">{t('subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportModalOpen(true)}
                className="gap-2 font-bold text-[11px] uppercase tracking-widest border-destructive/20 hover:bg-destructive/5 hover:text-destructive"
              >
                <Upload className="w-3.5 h-3.5" />
                {t('import_data')}
              </Button>
            )}
            {entries && entries.length > 0 && (
              <div className="flex items-center gap-1.5 p-1 bg-muted/30 rounded-xl border border-border">
                <button
                  onClick={() => handleExport('pdf')}
                  className="h-8 px-3 flex items-center gap-2 rounded-lg hover:bg-muted text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="h-8 px-3 flex items-center gap-2 rounded-lg hover:bg-muted text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  EXCEL
                </button>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{tCommon('status')}</span>
            </div>
          </div>
        </div>

        {/* ─── Search & Filters ─── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full pl-11 pr-4 py-3 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>

          <div className="flex gap-2 text-nowrap overflow-x-auto pb-1 scrollbar-none">
            {ENTRY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={clsx(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap",
                  filterType === type
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-muted/20 border-border/60 text-muted-foreground hover:border-primary/30"
                )}
              >
                {t(`types.${type}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Results Table ─── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center min-w-[80px] sticky left-0 bg-muted/40 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-border">
                  {tCommon('status')}
                </th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground sticky left-16 bg-muted/40 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-border min-w-[200px]">
                  {t('fields.name_arabic')}
                </th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r border-border min-w-[200px]">
                  {t('fields.name_latin')}
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r border-border min-w-[120px]">
                  {t('fields.nationality')}
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r border-border min-w-[150px]">
                  {t('fields.doc_number')}
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r border-border min-w-[150px]">
                  {t('fields.category')}
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r border-border min-w-[120px]">
                  {t('fields.dob')}
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r border-border min-w-[120px]">
                  {t('fields.pob')}
                </th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r border-border min-w-[250px]">
                  {t('fields.address')}
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r border-border min-w-[180px]">
                  {t('fields.issuing_authority')}
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r border-border min-w-[120px]">
                  {t('fields.issue_date')}
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r border-border min-w-[120px]">
                  {t('fields.expiry_date')}
                </th>
                <th className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r border-border min-w-[400px]">
                  {t('fields.reasons')}
                </th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground min-w-[250px]">
                  {t('fields.other_info')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <AnimatePresence mode="popLayout" initial={false}>
                {entries?.map((entry) => (
                  <motion.tr
                    key={entry._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-muted/30 transition-colors border-b border-border/40"
                  >
                    <td className="px-4 py-3 text-center sticky left-0 bg-card group-hover:bg-muted/30 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-border/60">
                      <div className={clsx(
                        "inline-flex p-1.5 rounded-lg border",
                        entry.type === 'individual' ? "bg-blue-500/10 border-blue-500/20 text-blue-600" :
                          entry.type === 'entity' ? "bg-amber-500/10 border-amber-500/20 text-amber-600" :
                            "bg-purple-500/10 border-purple-500/20 text-purple-600"
                      )}>
                        {entry.type === 'individual' ? <User className="w-3.5 h-3.5" /> :
                          entry.type === 'entity' ? <Building2 className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                      </div>
                    </td>
                    <td className="px-6 py-3 font-bold text-foreground sticky left-16 bg-card group-hover:bg-muted/30 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-border/60">
                      {entry.nameArabic}
                    </td>
                    <td className="px-6 py-3 text-xs font-semibold text-muted-foreground italic border-r border-border/40">
                      {entry.nameLatin || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold border-r border-border/40">
                      {entry.nationality || '—'}
                    </td>
                    <td className="px-4 py-3 text-[11px] font-mono font-bold text-primary border-r border-border/40">
                      {entry.documentNumber || '—'}
                    </td>
                    <td className="px-4 py-3 border-r border-border/40">
                      <span className="px-2 py-1 rounded-md bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-tight border border-destructive/20 whitespace-nowrap">
                        {entry.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap border-r border-border/40">
                      {entry.dob || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap border-r border-border/40">
                      {entry.pob || '—'}
                    </td>
                    <td className="px-6 py-3 text-xs text-muted-foreground border-r border-border/40 leading-relaxed min-w-[250px]">
                      {entry.address || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground border-r border-border/40 font-medium">
                      {entry.issuingAuthority || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground border-r border-border/40 whitespace-nowrap">
                      {entry.issueDate || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground border-r border-border/40 whitespace-nowrap">
                      {entry.expiryDate || '—'}
                    </td>
                    <td className="px-8 py-3 text-xs text-destructive/80 font-bold border-r border-border/40 leading-relaxed">
                      {entry.reasons || '—'}
                    </td>
                    <td className="px-6 py-3 text-xs text-muted-foreground italic leading-relaxed">
                      {entry.otherInfo || '—'}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* ── Empty State ── */}
        {entries?.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground opacity-20" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg">{t('no_results_title')}</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {t('no_results_desc')}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
              {tCommon('clear_search')}
            </Button>
          </div>
        )}
      </div>

      {/* ─── Import Modal ─── */}
      <AnimatePresence>
        {isImportModalOpen && (
          <>
            {/* Overlay — no ARIA role, purely visual */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !importLoading && setIsImportModalOpen(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                aria-hidden="true"
              />
              {/* Dialog panel — role/aria-modal/aria-labelledby belong here (WAI-ARIA APG) */}
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="import-watchlist-title"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-8 space-y-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 id="import-watchlist-title" className="text-xl font-bold">{t('import_modal.title')}</h3>
                      <p className="text-xs text-muted-foreground font-medium">{t('import_modal.desc')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => !importLoading && setIsImportModalOpen(false)}
                    disabled={importLoading}
                    aria-label={tCommon('cancel')}
                    className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all disabled:opacity-50 flex-shrink-0"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-6 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center space-y-4 hover:border-primary/50 transition-colors relative group">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      disabled={importLoading}
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                      {importLoading ? <Clock className="w-6 h-6 text-primary animate-spin" /> : <Download className="w-6 h-6 text-muted-foreground" />}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold">
                        {importLoading
                          ? `${t('import_modal.uploading')} (${importProgress.current}/${importProgress.total})`
                          : t('import_modal.drop_file')}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">.xlsx, .xls, .csv ONLY</p>
                    </div>
                  </div>

                  {importError && (
                    <div className="flex items-center gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-xl text-destructive text-xs font-bold">
                      <XCircle className="w-4 h-4" />
                      {importError}
                    </div>
                  )}

                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 underline">Critical Warning</span>
                    </div>
                    <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
                      {t('import_modal.warning')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setIsImportModalOpen(false)}
                    disabled={importLoading}
                  >
                    {tCommon('cancel')}
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
