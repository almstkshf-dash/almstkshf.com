/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, Shield, AlertTriangle, User, Users, Building2,
  FileText, Upload, Trash2, Clock, CheckCircle2, XCircle,
  ExternalLink, Info, Filter, Download, ChevronDown, ChevronUp, X,
  ShieldCheck, Edit2, Plus
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useConvexAuth, usePaginatedQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ExcelJS from 'exceljs';
import { ReportGenerator } from '@/lib/report-generator';

// Types
import { TerroristListItem, ReportTranslations } from '@/types/reports';


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
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  // Record CRUD State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Partial<TerroristListItem> | null>(null);
  const [recordFormLoading, setRecordFormLoading] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

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
  const {
    results: entries,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.terroristList.searchPaginated,
    {
      searchTerm: searchQuery,
      type: filterType === 'all' ? undefined : filterType
    },
    { initialNumItems: 50 }
  );

  const wipeAll = useMutation(api.terroristList.wipeAll);
  const addItems = useMutation(api.terroristList.addItems);
  const addSingleItem = useMutation(api.terroristList.addSingleItem);
  const updateItem = useMutation(api.terroristList.updateItem);
  const deleteItem = useMutation(api.terroristList.deleteItem);
  const deleteItems = useMutation(api.terroristList.deleteItems);
  const createCollection = useMutation(api.collections.createCollection);
  const addMultipleToCollection = useMutation(api.collections.addMultipleToCollection);
  const settings = useQuery(api.settings.getSettings);

  // ─── Multi-Select Handlers ──────────────────────────────────────────────
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (!entries) return;
    if (selectedIds.size === entries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(entries.map(e => e._id)));
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    let dataToExport = entries;
    if (selectedIds.size > 0) {
      dataToExport = entries?.filter(e => selectedIds.has(e._id));
    }
    if (!dataToExport || dataToExport.length === 0) return;
    try {
      // Build export translations using correct media monitoring terminology
      const exportTranslations: ReportTranslations = {
        brand_name: settings?.brandName || 'ALMSTKSHF',
        brand_tagline: settings?.brandTagline || 'MEDIA MONITORING & DEVELOPMENT',
        footer_url: settings?.footerUrl || 'www.almstkshf.com',
        logo_url: settings?.logoUrl || undefined,
        TerroristList: {
          title: t('title'),           // تقرير فحص قوائم العقوبات
          fields: {
            name_arabic: t('fields.name_arabic'),       // الاسم بالعربي
            name_latin: t('fields.name_latin'),         // الاسم بالأحرف اللاتينية
            nationality: t('fields.nationality'),       // الجنسية
            doc_number: t('fields.doc_number'),         // رقم الوثيقة
            category: t('fields.category'),             // التصنيف
            reasons: t('fields.reasons'),               // أسباب الإدراج
            dob: t('fields.dob'),                       // تاريخ الميلاد
            pob: t('fields.pob'),                       // مكان الميلاد
            address: t('fields.address'),               // عنوان الإقامة
            issuing_authority: t('fields.issuing_authority'), // جهة الإصدار
            issue_date: t('fields.issue_date'),         // تاريخ القرار
            expiry_date: t('fields.expiry_date'),       // تاريخ انتهاء السريان
            other_info: t('fields.other_info'),         // بيانات إضافية
          }
        },
        Reports: {
          generated_at: 'تاريخ الإصدار',  // Issue Date
          pr_title: t('title'),
        }
      };

      await ReportGenerator.exportTerroristListReport(dataToExport, exportTranslations, format);
    } catch (err) {
      console.error('Watchlist export failed:', err);
    }
  };

  // ─── CRUD Handlers ──────────────────────────────────────────────────────
  const handleSaveRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin) return;
    setRecordFormLoading(true);

    try {
      if (editingRecord?._id) {
        await updateItem({
          id: editingRecord._id as any,
          type: editingRecord.type as any,
          category: editingRecord.category,
          nameArabic: editingRecord.nameArabic,
          nameLatin: editingRecord.nameLatin,
          nationality: editingRecord.nationality,
          dob: editingRecord.dob,
          pob: editingRecord.pob,
          address: editingRecord.address,
          documentNumber: editingRecord.documentNumber,
          issuingAuthority: editingRecord.issuingAuthority,
          issueDate: editingRecord.issueDate,
          expiryDate: editingRecord.expiryDate,
          otherInfo: editingRecord.otherInfo,
          reasons: editingRecord.reasons,
        });
      } else {
        await addSingleItem({
          type: (editingRecord?.type as any) || 'individual',
          category: editingRecord?.category || 'Designated',
          nameArabic: editingRecord?.nameArabic || '',
          nameLatin: editingRecord?.nameLatin || '',
          nationality: editingRecord?.nationality,
          dob: editingRecord?.dob,
          pob: editingRecord?.pob,
          address: editingRecord?.address,
          documentNumber: editingRecord?.documentNumber,
          issuingAuthority: editingRecord?.issuingAuthority,
          issueDate: editingRecord?.issueDate,
          expiryDate: editingRecord?.expiryDate,
          otherInfo: editingRecord?.otherInfo,
          reasons: editingRecord?.reasons,
        });
      }
      setIsRecordModalOpen(false);
      setEditingRecord(null);
    } catch (err) {
      console.error('Failed to save record:', err);
    } finally {
      setRecordFormLoading(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!deleteConfirmationId || !isAdmin) return;
    try {
      await deleteItem({ id: deleteConfirmationId as any });
      setDeleteConfirmationId(null);
    } catch (err) {
      console.error('Failed to delete record:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (!isAdmin || selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      await deleteItems({ ids: Array.from(selectedIds) as any });
      setSelectedIds(new Set());
      setIsBulkDeleteModalOpen(false);
    } catch (err) {
      console.error('Failed to bulk delete:', err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSaveToCollection = async () => {
    if (!collectionName.trim() || selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const selectedEntries = entries?.filter(e => selectedIds.has(e._id)) || [];
      const collectionId = await createCollection({ name: collectionName.trim() });
      await addMultipleToCollection({
        collectionId,
        items: selectedEntries.map(e => ({
          id: e._id,
          type: 'watchlist',
          title: e.nameArabic || e.nameLatin || 'Unknown',
          data: e
        }))
      });
      setSelectedIds(new Set());
      setIsCollectionModalOpen(false);
      setCollectionName('');
      alert('تم الحفظ في القائمة بنجاح!');
    } catch (err) {
      console.error('Failed to save to collection:', err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // ─── File Upload Handlers ──────────────────────────────────────────────
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
          const buffer = evt.target?.result as ArrayBuffer;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);

          let allData: Partial<TerroristListItem>[] = [];

          // Process all sheets
          workbook.eachSheet(sheet => {
            const sheetRows: Record<string, string>[] = [];
            const headerRow = sheet.getRow(1);
            // row.values returns [empty, col1, col2, ...]
            const headers = (headerRow.values as (string | number | boolean | null)[]).map(v => v ? String(v).trim() : '');

            sheet.eachRow((row, rowNumber) => {
              if (rowNumber === 1) return; // skip header row
              const rowData: Record<string, string> = {};
              row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                const header = headers[colNumber];
                if (header) {
                  let cellVal = cell.value;
                  if (cellVal instanceof Date) {
                    rowData[header] = cellVal.toISOString().split('T')[0];
                  } else {
                    rowData[header] = cell.text || String(cellVal || "");
                  }
                }
              });
              sheetRows.push(rowData);
            });

            const mapped = sheetRows.map((row) => {
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
                  if (foundKey && String(row[foundKey]).trim()) {
                    let val = String(row[foundKey]).trim();
                    // Fix ugly timezone string e.g. "Fri Jan 01 1965 04:00:00 GMT+0400 (Gulf Standard Time)"
                    const dateMatch = val.match(/^[a-zA-Z]{3} ([a-zA-Z]{3} \d{2} \d{4}) \d{2}:\d{2}:\d{2} GMT/);
                    if (dateMatch && dateMatch[1]) {
                      const d = new Date(val);
                      if (!isNaN(d.getTime())) {
                        val = d.toISOString().split('T')[0];
                      }
                    }
                    return val;
                  }
                }
                return "";
              };

              const nameAr = getVal(['الاسم بالكامل', 'الاسم بالعربية', 'اسم الفرد', 'اسم الشخص', 'اسم المنشأة', 'الاسم الكامل', 'الاسم', 'Name Arabic', 'Name (Arabic)', 'Full Name Arabic', 'Ar Name']);
              const nameEn = getVal(['الاسم بالإنجليزية', 'الاسم باللاتينية', 'English Name', 'Name (English)', 'Latin Name', 'Full Name', 'Name Latin', 'Name (Latin)', 'Name English', 'En Name']);
              const typeRaw = getVal(['النوع', 'فئة المدرج', 'Type', 'Category', 'Classification']).toLowerCase();

              return {
                nameArabic: nameAr,
                nameLatin: nameEn,
                type: (typeRaw.includes('فرد') || typeRaw.includes('individual') || typeRaw.includes('person') ? 'individual' :
                  typeRaw.includes('منشأة') || typeRaw.includes('كيان') || typeRaw.includes('entity') || typeRaw.includes('company') ? 'entity' :
                    typeRaw.includes('منظمة') || typeRaw.includes('org') || typeRaw.includes('organization') ? 'organization' : 'individual') as 'individual' | 'entity' | 'organization',
                nationality: getVal(['الجنسية', 'الدولة', 'المواطنة', 'Nationality', 'Citizen', 'Country', 'State']),
                category: getVal(['الفئة', 'المدرج', 'الحالة', 'Category', 'Status', 'Description', 'List Name']) || 'Designated',
                documentNumber: getVal(['رقم القضية', 'رقم الوثيقة', 'رقم الجواز', 'رقم الهوية', 'الرقم المدني', 'Document Number', 'ID', 'Passport', 'Identifiier', 'Doc #']),
                reasons: getVal(['رقم قرار ادراج الارهابيين', 'الأسباب', 'سبب الإدراج', 'الأسس القانونية', 'التفاصيل', 'Reasons', 'Comments', 'Legal Grounds', 'Basis', 'Summary', 'أسباب الإدراج']),
                dob: getVal(['تاريخ الميلاد', 'تاريخ الميلاد/التأسيس', 'سنة الميلاد', 'DOB', 'Date of Birth', 'Birth Date']),
                pob: getVal(['مكان الميلاد', 'بلد المنشأ', 'POB', 'Place of Birth', 'Address of Birth']),
                address: getVal(['العنوان', 'المكان', 'مقر الإقامة', 'Address', 'Location', 'Residence']),
                issuingAuthority: getVal(['جهة الإصدار', 'المصدر', 'الجهة المختصة', 'Issuing Authority', 'Issuer', 'Authority']),
                issueDate: getVal(['تاريخ النشر', 'تاريخ الإصدار', 'تاريخ القرار', 'Issue Date', 'Decision Date']),
                expiryDate: getVal(['تاريخ الانتهاء', 'تاريخ النفاذ حتى', 'Expiry Date', 'Expiration', 'Valid To']),
                otherInfo: getVal(['عدد النشر', 'معلومات أخرى', 'ملاحظات', 'الكنية', 'بيانات إضافية', 'Other Info', 'Notes', 'Remarks', 'البيانات المرفوعة', 'Metadata', 'Nickname', 'Alias']),
              } as Partial<TerroristListItem>;
            });

            // Filter out empty rows
            const validRows = mapped.filter(r => r.nameArabic || r.nameLatin);
            allData = [...allData, ...validRows];
          });

          if (allData.length === 0) {
            throw new Error("No valid data found in sheets");
          }

          // Trigger Convex Mutation if replace mode
          if (importMode === 'replace') {
            await wipeAll({});
          }

          const totalChunks = Math.ceil(allData.length / 200);
          setImportProgress({ current: 0, total: totalChunks });

          let totalAdded = 0;
          let totalSkipped = 0;

          // Chunk the data to avoid size limits
          const chunkSize = 200;
          for (let i = 0; i < allData.length; i += chunkSize) {
            const chunk = allData.slice(i, i + chunkSize);
            const res = await addItems({ items: chunk as any });
            if (res) {
              totalAdded += res.added;
              totalSkipped += res.skipped;
            }
            setImportProgress(prev => ({ ...prev, current: prev.current + 1 }));
          }

          setIsImportModalOpen(false);
          alert(`Import complete!\nAdded: ${totalAdded} new records.\nSkipped: ${totalSkipped} duplicates.`);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to parse file";
          setImportError(msg);
        } finally {
          setImportLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err: unknown) {
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
              <Shield className="w-6 h-6 text-rose-600 dark:text-rose-400" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">{t('title')}</h2>
              <p className="text-xs text-foreground/70 font-medium">{t('subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingRecord({ type: 'individual' });
                    setIsRecordModalOpen(true);
                  }}
                  className="gap-2 font-bold text-[11px] uppercase tracking-widest"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('add_record')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImportModalOpen(true)}
                  className="gap-2 font-bold text-[11px] uppercase tracking-widest border-destructive/20 hover:bg-destructive/5 hover:text-rose-600 dark:hover:text-rose-400"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {t('import_data')}
                </Button>
              </>
            )}
            {entries && entries.length > 0 && (
              <div className="flex items-center gap-1.5 p-1 bg-muted/30 rounded-xl border border-border">
                <button
                  onClick={() => handleExport('pdf')}
                  aria-label="Export as PDF"
                  className="h-8 px-3 flex items-center gap-2 rounded-lg text-foreground bg-muted/10 hover:bg-muted/20 border border-border text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  PDF
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  aria-label="Export as Excel"
                  className="h-8 px-3 flex items-center gap-2 rounded-lg text-foreground bg-muted/10 hover:bg-muted/20 border border-border text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                  EXCEL
                </button>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">{tCommon('status')}</span>
            </div>
          </div>
        </div>

        {/* ─── Search & Filters ─── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60" aria-hidden="true" />
            <input
              type="text"
              id="watchlist-search"
              aria-label={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full ps-11 pe-4 py-3 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>

          <div className="flex gap-2 text-nowrap overflow-x-auto pb-1 scrollbar-none">
            {ENTRY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                aria-pressed={filterType === type}
                className={clsx(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap",
                  filterType === type
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-muted/20 border-border/60 text-foreground/60 hover:border-primary/30"
                )}
              >
                {t(`types.${type}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Bulk Actions Bar ─── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-4 left-4 right-4 md:sticky md:top-4 md:bottom-auto md:left-auto md:right-auto z-50 bg-background/95 backdrop-blur-md border border-primary/20 rounded-xl p-3 flex items-center justify-between shadow-lg shadow-primary/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold">
                {selectedIds.size}
              </div>
              <span className="text-sm font-bold text-foreground">
                Selected {selectedIds.size === 1 ? 'Record' : 'Records'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                className="text-[10px] uppercase tracking-widest font-bold"
              >
                Clear
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCollectionModalOpen(true)}
                className="text-[10px] uppercase tracking-widest font-bold bg-primary hover:bg-primary/90 text-primary-foreground border-none"
              >
                Save to Collection
              </Button>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="text-[10px] uppercase tracking-widest font-bold border-destructive/20 text-rose-600 hover:bg-destructive/10 dark:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Results Table (Desktop) ─── */}
      <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th scope="col" className="px-4 py-3 sticky left-0 bg-muted/40 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-border z-10 w-[40px]">
                  <input
                    type="checkbox"
                    checked={entries && entries.length > 0 && selectedIds.size === entries.length}
                    onChange={toggleAll}
                    className="rounded border-border text-primary focus:ring-primary/20 bg-card cursor-pointer"
                  />
                </th>
                <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/70 text-center min-w-[80px] sticky left-[40px] bg-muted/40 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-border z-10">
                  {tCommon('status')}
                </th>
                <th scope="col" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/70 sticky left-[120px] bg-muted/40 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-border min-w-[200px] z-10">
                  {t('fields.name_arabic')}
                </th>
                <th scope="col" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/70 border-r border-border min-w-[200px]">
                  {t('fields.name_latin')}
                </th>
                <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/70 border-r border-border min-w-[120px]">
                  {t('fields.nationality')}
                </th>
                <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/70 border-r border-border min-w-[150px]">
                  {t('fields.doc_number')}
                </th>
                <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/70 border-r border-border min-w-[150px]">
                  {t('fields.category')}
                </th>
                <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/70 border-r border-border min-w-[120px]">
                  {t('fields.dob')}
                </th>
                <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/70 border-r border-border min-w-[120px]">
                  {t('fields.pob')}
                </th>
                <th scope="col" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/70 border-r border-border min-w-[250px]">
                  {t('fields.address')}
                </th>
                <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/70 border-r border-border min-w-[180px]">
                  {t('fields.issuing_authority')}
                </th>
                <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/70 border-r border-border min-w-[120px]">
                  {t('fields.issue_date')}
                </th>
                <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/70 border-r border-border min-w-[120px]">
                  {t('fields.expiry_date')}
                </th>
                <th scope="col" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/70 border-r border-border min-w-[300px]">
                  {t('fields.reasons')}
                </th>
                <th scope="col" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/70 min-w-[250px]">
                  {t('fields.other_info')}
                </th>
                {isAdmin && (
                  <th scope="col" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/70 text-center sticky right-0 bg-muted/40 shadow-[-2px_0_5px_rgba(0,0,0,0.05)] border-l border-border min-w-[100px]">
                    {t('actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <AnimatePresence mode="popLayout" initial={false}>
                {entries?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((entry) => (
                  <motion.tr
                    key={entry._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-muted/30 transition-colors border-b border-border/40"
                  >
                    <td className="px-4 py-3 sticky left-0 bg-card group-hover:bg-muted/30 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-border/60 z-10 w-[40px]">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(entry._id)}
                        onChange={() => toggleSelection(entry._id)}
                        className="rounded border-border text-primary focus:ring-primary/20 bg-card cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-center sticky left-[40px] bg-card group-hover:bg-muted/30 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-border/60 z-10">
                      <div className={clsx(
                        "inline-flex p-1.5 rounded-lg border",
                        entry.type === 'individual' ? "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400" :
                          entry.type === 'entity' ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400" :
                            "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-400"
                      )}>
                        {entry.type === 'individual' ? <User className="w-3.5 h-3.5" aria-hidden="true" /> :
                          entry.type === 'entity' ? <Building2 className="w-3.5 h-3.5" aria-hidden="true" /> : <Users className="w-3.5 h-3.5" aria-hidden="true" />}
                      </div>
                    </td>
                    <td className="px-6 py-3 font-bold text-foreground sticky left-[120px] bg-card group-hover:bg-muted/30 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-border/60 z-10">
                      {entry.nameArabic}
                    </td>
                    <td className="px-6 py-3 text-xs font-semibold text-foreground/70 italic border-r border-border/40">
                      {entry.nameLatin || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold border-r border-border/40">
                      {entry.nationality || '—'}
                    </td>
                    <td className="px-4 py-3 text-[11px] font-mono font-bold text-foreground border-r border-border/40">
                      {entry.documentNumber || '—'}
                    </td>
                    <td className="px-4 py-3 border-r border-border/40">
                      <span className="px-2 py-1 rounded-md bg-destructive/10 text-red-700 dark:text-red-400 text-[10px] font-black uppercase tracking-tight border border-destructive/20 whitespace-nowrap">
                        {entry.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground/70 whitespace-nowrap border-r border-border/40">
                      {entry.dob || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground/70 whitespace-nowrap border-r border-border/40">
                      {entry.pob || '—'}
                    </td>
                    <td className="px-6 py-3 text-xs text-foreground/70 border-r border-border/40 leading-relaxed min-w-[250px]">
                      {entry.address || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground/70 border-r border-border/40 font-medium">
                      {entry.issuingAuthority || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground border-r border-border/40 whitespace-nowrap">
                      {entry.issueDate || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground border-r border-border/40 whitespace-nowrap">
                      {entry.expiryDate || '—'}
                    </td>
                    <td className="px-8 py-3 text-xs text-rose-700 dark:text-rose-300 font-bold border-r border-border/40 leading-relaxed">
                      {entry.reasons || '—'}
                    </td>
                    <td className="px-6 py-3 text-xs text-foreground/70 italic leading-relaxed">
                      {entry.otherInfo || '—'}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-center sticky right-0 bg-card group-hover:bg-muted/30 shadow-[-2px_0_5px_rgba(0,0,0,0.05)] border-l border-border/60">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingRecord(entry);
                              setIsRecordModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground/60 hover:text-primary transition-colors"
                            aria-label={t('edit_record')}
                          >
                            <Edit2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirmationId(entry._id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-foreground/60 hover:text-destructive transition-colors"
                            aria-label={t('delete')}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Results Cards (Mobile) ─── */}
      <div className="md:hidden space-y-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {entries?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((entry) => (
            <motion.div
              key={entry._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={clsx(
                "p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden group shadow-sm bg-card",
                selectedIds.has(entry._id) ? "border-primary ring-1 ring-primary/20 shadow-primary/10" : "border-border hover:border-primary/50"
              )}
            >
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.has(entry._id)}
                  onChange={() => toggleSelection(entry._id)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20 bg-card cursor-pointer"
                />
              </div>

              <div className="flex items-start gap-3 mb-4">
                <div className={clsx(
                  "p-2 rounded-xl border flex-shrink-0 mt-1",
                  entry.type === 'individual' ? "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400" :
                    entry.type === 'entity' ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400" :
                      "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-400"
                )}>
                  {entry.type === 'individual' ? <User className="w-5 h-5" aria-hidden="true" /> :
                    entry.type === 'entity' ? <Building2 className="w-5 h-5" aria-hidden="true" /> : <Users className="w-5 h-5" aria-hidden="true" />}
                </div>
                <div>
                  <h4 className="font-bold text-foreground pr-8 text-base">{entry.nameArabic}</h4>
                  <p className="text-sm text-foreground/70 italic mb-1">{entry.nameLatin || '—'}</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight bg-destructive/10 border border-destructive/20 text-red-700 dark:text-red-400 inline-block">
                    {entry.category}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div className="bg-muted/30 p-2 rounded-lg border border-border/50">
                  <span className="block text-[10px] uppercase text-muted-foreground font-bold mb-1">{t('fields.nationality')}</span>
                  <span className="font-medium text-foreground">{entry.nationality || '—'}</span>
                </div>
                <div className="bg-muted/30 p-2 rounded-lg border border-border/50">
                  <span className="block text-[10px] uppercase text-muted-foreground font-bold mb-1">{t('fields.doc_number')}</span>
                  <span className="font-mono text-foreground">{entry.documentNumber || '—'}</span>
                </div>
                {entry.dob && (
                  <div className="bg-muted/30 p-2 rounded-lg border border-border/50 col-span-2">
                    <span className="block text-[10px] uppercase text-muted-foreground font-bold mb-1">{t('fields.dob')}</span>
                    <span className="text-foreground">{entry.dob}</span>
                  </div>
                )}
              </div>

              {entry.reasons && (
                <div className="text-xs border-l-2 border-rose-500 pl-3 py-1 mb-4 bg-rose-500/5 rounded-r-lg pr-2">
                  <span className="block text-[10px] uppercase text-rose-700/70 font-bold mb-1">{t('fields.reasons')}</span>
                  <p className="text-rose-700 dark:text-rose-300 font-medium leading-relaxed">{entry.reasons}</p>
                </div>
              )}

              {isAdmin && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs text-foreground/60 hover:text-primary"
                    onClick={() => {
                      setEditingRecord(entry);
                      setIsRecordModalOpen(true);
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    {t('edit_record')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs text-foreground/60 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setDeleteConfirmationId(entry._id);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    {t('delete')}
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Empty State ── */}
        {entries?.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-5 relative overflow-hidden rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center relative shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping opacity-40" />
              <ShieldCheck className="w-8 h-8 text-emerald-500 dark:text-emerald-400" aria-hidden="true" />
            </div>
            <div className="space-y-2 relative z-10 max-w-md px-4">
              <h3 className="font-bold text-lg text-emerald-700 dark:text-emerald-400">
                {t('no_results_title')}
              </h3>
              <p className="text-xs text-foreground/70 leading-relaxed">
                {t('no_results_desc')}
              </p>
            </div>
            <div className="flex gap-2 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                  {t('sanctions_check_active')}
                </span>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1 bg-muted hover:bg-muted/80 border border-border text-[9px] font-black uppercase tracking-widest rounded-full transition-colors text-foreground"
                >
                  {tCommon('clear_search')}
                </button>
              )}
            </div>
          </div>
        )}

        {status === "CanLoadMore" && (
          <div className="p-4 flex justify-center bg-card border-t border-border">
            <Button
              variant="outline"
              onClick={() => loadMore(50)}
              className="text-xs uppercase tracking-widest font-bold"
            >
              Load More
            </Button>
          </div>
        )}

      {/* ─── Import Modal ─── */}
      <AnimatePresence>
        {isImportModalOpen && (
          <>
            {/* Overlay — no ARIA role, purely visual */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              { }
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !importLoading && setIsImportModalOpen(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                aria-hidden="true"
              />
              { }
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
                      <Upload className="w-6 h-6 text-blue-800 dark:text-blue-300" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 id="import-watchlist-title" className="text-xl font-bold">{t('import_modal.title')}</h3>
                      <p className="text-xs text-foreground/70 font-medium">{t('import_modal.desc')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => !importLoading && setIsImportModalOpen(false)}
                    disabled={importLoading}
                    aria-label={tCommon('cancel')}
                    className="p-2 rounded-xl hover:bg-muted text-foreground/60 transition-all disabled:opacity-50 flex-shrink-0"
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
                      aria-label="Upload watchlist file"
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                      {importLoading ? <Clock className="w-6 h-6 text-primary animate-spin" aria-hidden="true" /> : <Download className="w-6 h-6 text-foreground/60" aria-hidden="true" />}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold">
                        {importLoading
                          ? `${t('import_modal.uploading')} (${importProgress.current}/${importProgress.total})`
                          : t('import_modal.drop_file')}
                      </p>
                      <p className="text-[10px] text-foreground/60 uppercase font-black tracking-widest mt-1">.xlsx, .xls, .csv ONLY</p>
                    </div>
                  </div>

                  {importError && (
                    <div className="flex items-center gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-bold" role="alert">
                      <XCircle className="w-4 h-4" aria-hidden="true" />
                      {importError}
                    </div>
                  )}

                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-4">
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <input
                          type="radio"
                          name="importMode"
                          value="append"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                          className="text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="text-sm font-bold">Append to existing list (Recommended)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                        <input
                          type="radio"
                          name="importMode"
                          value="replace"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="text-destructive focus:ring-destructive h-4 w-4"
                        />
                        <span className="text-sm font-bold text-destructive">Replace existing list</span>
                      </label>
                    </div>

                    {importMode === 'replace' && (
                      <div className="space-y-2 mt-4 pt-4 border-t border-amber-500/20">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 underline">Critical Warning</span>
                        </div>
                        <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
                          {t('import_modal.warning')}
                        </p>
                      </div>
                    )}
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

      {/* ─── Record CRUD Modal ─── */}
      <AnimatePresence>
        {isRecordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !recordFormLoading && setIsRecordModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-card border border-border rounded-3xl shadow-2xl p-8 space-y-6"
            >
              <div className="flex items-start justify-between gap-4 sticky top-0 bg-card z-10 pb-4 border-b border-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    {editingRecord?._id ? <Edit2 className="w-6 h-6 text-primary" /> : <Plus className="w-6 h-6 text-primary" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{editingRecord?._id ? t('edit_record') : t('add_record')}</h3>
                    <p className="text-xs text-foreground/70 font-medium">Fill in the details for the local watchlist.</p>
                  </div>
                </div>
                <button
                  onClick={() => !recordFormLoading && setIsRecordModalOpen(false)}
                  disabled={recordFormLoading}
                  className="p-2 rounded-xl hover:bg-muted text-foreground/60 transition-all disabled:opacity-50"
                  aria-label={tCommon('cancel')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveRecord} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-foreground/70">Type</label>
                    <select
                      value={editingRecord?.type || 'individual'}
                      onChange={(e) => setEditingRecord({ ...editingRecord, type: e.target.value as any })}
                      required
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="individual">{t('types.individual')}</option>
                      <option value="entity">{t('types.entity')}</option>
                      <option value="organization">{t('types.organization')}</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-foreground/70">{t('fields.category')}</label>
                    <input
                      type="text"
                      value={editingRecord?.category || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, category: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-foreground/70">{t('fields.name_arabic')}</label>
                    <input
                      type="text"
                      value={editingRecord?.nameArabic || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, nameArabic: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 text-right"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-foreground/70">{t('fields.name_latin')}</label>
                    <input
                      type="text"
                      value={editingRecord?.nameLatin || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, nameLatin: e.target.value })}
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-foreground/70">{t('fields.nationality')}</label>
                    <input
                      type="text"
                      value={editingRecord?.nationality || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, nationality: e.target.value })}
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-foreground/70">{t('fields.doc_number')}</label>
                    <input
                      type="text"
                      value={editingRecord?.documentNumber || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, documentNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-foreground/70">{t('fields.dob')}</label>
                    <input
                      type="text"
                      value={editingRecord?.dob || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, dob: e.target.value })}
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-foreground/70">{t('fields.pob')}</label>
                    <input
                      type="text"
                      value={editingRecord?.pob || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, pob: e.target.value })}
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-foreground/70">{t('fields.address')}</label>
                    <input
                      type="text"
                      value={editingRecord?.address || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, address: e.target.value })}
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-foreground/70">{t('fields.issuing_authority')}</label>
                    <input
                      type="text"
                      value={editingRecord?.issuingAuthority || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, issuingAuthority: e.target.value })}
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-foreground/70">{t('fields.issue_date')}</label>
                    <input
                      type="text"
                      value={editingRecord?.issueDate || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, issueDate: e.target.value })}
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-foreground/70">{t('fields.expiry_date')}</label>
                    <input
                      type="text"
                      value={editingRecord?.expiryDate || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-foreground/70">{t('fields.reasons')}</label>
                    <textarea
                      value={editingRecord?.reasons || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, reasons: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-foreground/70">{t('fields.other_info')}</label>
                    <textarea
                      value={editingRecord?.otherInfo || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, otherInfo: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/50 sticky bottom-0 bg-card">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsRecordModalOpen(false)}
                    disabled={recordFormLoading}
                  >
                    {tCommon('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={recordFormLoading}
                    className="min-w-[120px]"
                  >
                    {recordFormLoading ? <Clock className="w-4 h-4 animate-spin" /> : t('save_changes')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirmation Modal ─── */}
      <AnimatePresence>
        {deleteConfirmationId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmationId(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl p-6 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{t('confirm_delete_title')}</h3>
                <p className="text-sm text-foreground/70">{t('confirm_delete_msg')}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirmationId(null)}>
                  {tCommon('cancel')}
                </Button>
                <Button variant="danger" className="flex-1" onClick={handleDeleteRecord}>
                  {t('delete_record')}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Bulk Delete Modal ─── */}
      <AnimatePresence>
        {isBulkDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !bulkActionLoading && setIsBulkDeleteModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl p-6 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">حذف المحدد</h3>
                <p className="text-sm text-foreground/70">هل أنت متأكد من حذف {selectedIds.size} عنصر محدد؟ لا يمكن التراجع عن هذا الإجراء.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setIsBulkDeleteModalOpen(false)} disabled={bulkActionLoading}>
                  {tCommon('cancel')}
                </Button>
                <Button variant="danger" className="flex-1" onClick={handleBulkDelete} isLoading={bulkActionLoading}>
                  حذف
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Save to Collection Modal ─── */}
      <AnimatePresence>
        {isCollectionModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !bulkActionLoading && setIsCollectionModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 space-y-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Filter className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">حفظ في قائمة مخصصة</h3>
                    <p className="text-xs text-foreground/70 font-medium">سيتم حفظ {selectedIds.size} عنصر في القائمة.</p>
                  </div>
                </div>
                <button
                  onClick={() => !bulkActionLoading && setIsCollectionModalOpen(false)}
                  disabled={bulkActionLoading}
                  className="p-2 rounded-xl hover:bg-muted text-foreground/60 transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-foreground/70">اسم القائمة</label>
                  <input
                    type="text"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    placeholder="مثال: قائمة الإرهاب المستهدفة 2026"
                    className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button variant="secondary" onClick={() => setIsCollectionModalOpen(false)} disabled={bulkActionLoading}>
                  {tCommon('cancel')}
                </Button>
                <Button variant="primary" onClick={handleSaveToCollection} disabled={!collectionName.trim()} isLoading={bulkActionLoading}>
                  حفظ القائمة
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
