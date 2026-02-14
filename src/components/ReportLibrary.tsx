"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FileText, Download, Calendar, Search, Filter } from "lucide-react";
import Button from "./ui/Button";
import { SkeletonReportRow } from "./ui/Skeleton";
import { useState } from "react";
import clsx from "clsx";

import { useTranslations } from "next-intl";

export default function ReportLibrary() {
    const t = useTranslations("MediaMonitoring.central_media_repository.library");
    const tCommon = useTranslations("Common");
    const reports = useQuery(api.queries.getMediaReports, {});
    const [searchTerm, setSearchTerm] = useState("");

    const filteredReports = reports?.filter((r: any) =>
        r.reportName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <label htmlFor="report-search" className="sr-only">{t('search_label')}</label>
                    <input
                        id="report-search"
                        name="q"
                        type="text"
                        placeholder={t('search_placeholder')}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
                        {t('filter')}
                    </Button>
                    <Button variant="outline" size="sm">
                        {t('recent_first')}
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {reports === undefined ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <SkeletonReportRow key={i} />
                    ))
                ) : filteredReports?.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                        <FileText className="w-12 h-12 text-slate-800 mx-auto" />
                        <p className="text-slate-500 font-medium">{t('no_results')}</p>
                    </div>
                ) : (
                    filteredReports?.map((report: any) => (
                        <div
                            key={report._id}
                            className="bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-slate-900/60 group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                                        {report.reportName}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(report.timestamp).toLocaleDateString()}
                                        </span>
                                        <span>•</span>
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded-full border",
                                            report.source === "TV" ? "border-purple-500/20 text-purple-400 bg-purple-500/5" :
                                                report.source === "Press" ? "border-cyan-500/20 text-cyan-400 bg-cyan-500/5" :
                                                    "border-rose-500/20 text-rose-400 bg-rose-500/5"
                                        )}>
                                            {report.source}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-800 hover:bg-slate-800"
                                >
                                    {t('preview')}
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    leftIcon={<Download className="w-3 h-3" />}
                                    className="bg-blue-600 hover:bg-blue-500"
                                >
                                    {tCommon('download')}
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
