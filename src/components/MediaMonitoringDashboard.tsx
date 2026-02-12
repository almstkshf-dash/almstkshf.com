"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTranslations } from "next-intl";
import { Mic2, Radio, Newspaper, Filter, Download, FileText } from "lucide-react";
import Button from "./ui/Button";
import clsx from "clsx";
import CrisisPlanCard from "./CrisisPlanCard";

export default function MediaMonitoringDashboard() {
    const t = useTranslations("Navigation");
    const [filter, setFilter] = useState<string | undefined>(undefined);

    // In a real app, we would use the query here. 
    // For now, we'll mock the data if the query fails or returns empty (since we haven't seeded data).
    // const reports = useQuery(api.queries.getMediaReports, { source: filter });

    // Mock Data for demonstration
    const reports = [
        { _id: "1", reportName: "Midday News Analysis", source: "TV", status: "Published", timestamp: Date.now() - 100000 },
        { _id: "2", reportName: "Morning Talk Show Sentiment", source: "Radio", status: "Draft", timestamp: Date.now() - 200000 },
        { _id: "3", reportName: "Tech Crunch Article", source: "Press", status: "Published", timestamp: Date.now() - 300000 },
    ].filter(r => !filter || r.source === filter);

    const crisisPlans = [
        { title: "Defamation Response", priority: "High" as const, actions: ["Legal Notice", "Press Release", "Social Silence"], status: "Active" },
        { title: "Misinformation Leak", priority: "Medium" as const, actions: ["Fact Check Publication", "Stakeholder Memo"], status: "Ready" },
    ];


    const filters = [
        { label: "All", value: undefined, icon: Filter },
        { label: "TV", value: "TV", icon: Mic2 },
        { label: "Radio", value: "Radio", icon: Radio },
        { label: "Press", value: "Press", icon: Newspaper },
    ];

    return (
        <div className="space-y-8">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                    <button
                        key={f.label}
                        onClick={() => setFilter(f.value)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                            filter === f.value
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                        )}
                    >
                        <f.icon className="w-4 h-4" />
                        <span>{f.label}</span>
                    </button>
                ))}
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports?.map((report) => (
                    <div key={report._id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2 bg-slate-800 rounded-lg text-blue-400 group-hover:text-blue-300 transition-colors">
                                <FileText className="w-5 h-5" />
                            </div>
                            <span className={clsx(
                                "px-2 py-0.5 text-xs rounded-full border",
                                report.status === "Published"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            )}>
                                {report.status}
                            </span>
                        </div>
                        <h3 className="font-medium text-slate-200 mb-1">{report.reportName}</h3>
                        <div className="text-xs text-slate-500 mb-4 flex gap-2">
                            <span>{report.source}</span>
                            <span>•</span>
                            <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full" leftIcon={<Download className="w-3 h-3" />}>
                            Download PDF
                        </Button>
                    </div>
                ))}
            </div>

            {/* Crisis Management Section */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-8 bg-rose-500 rounded-full block"></span>
                    Crisis Management Plans
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {crisisPlans.map((plan, i) => (
                        <CrisisPlanCard key={i} {...plan} />
                    ))}
                </div>
            </div>
        </div>
    );
}
