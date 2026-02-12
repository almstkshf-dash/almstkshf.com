"use client";

import { useState } from "react";
import { Key, Globe, Shield, RefreshCw, Eye, EyeOff, Check, Copy } from "lucide-react";
import Button from "./ui/Button";
import clsx from "clsx";
import { motion } from "framer-motion";

interface Integration {
    id: string;
    name: string;
    description: string;
    status: "connected" | "disconnected";
    apiKey?: string;
}

const initialIntegrations: Integration[] = [
    { id: "1", name: "Media Pulse API", description: "Connect to live sentiment data streams.", status: "connected", apiKey: "mk_live_51P...xxxxxxxxxxxxxx" },
    { id: "2", name: "LEXCORA Suite", description: "Legal ERP and document processing engine integration.", status: "connected", apiKey: "lc_prod_v2...xxxxxxxxxxxxxx" },
    { id: "3", name: "Strategic Advisor Webhooks", description: "Trigger events based on AI insights.", status: "disconnected" },
];

export default function IntegrationHub() {
    const [integrations, setIntegrations] = useState(initialIntegrations);
    const [showKey, setShowKey] = useState<Record<string, boolean>>({});
    const [copied, setCopied] = useState<string | null>(null);

    const toggleKey = (id: string) => {
        setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (key: string, id: string) => {
        navigator.clipboard.writeText(key);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
                {integrations.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-blue-500/30 transition-all"
                    >
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex gap-4">
                                <div className={clsx(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                    item.status === "connected" ? "bg-blue-500/10 text-blue-400" : "bg-slate-800 text-slate-500"
                                )}>
                                    <Key className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-white font-bold">{item.name}</h4>
                                        <span className={clsx(
                                            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                            item.status === "connected" ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-slate-800 text-slate-500 bg-slate-900"
                                        )}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-sm mt-1">{item.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {item.status === "connected" ? (
                                    <Button variant="outline" size="sm" className="text-rose-400 border-rose-500/20 hover:bg-rose-500/5">
                                        Revoke
                                    </Button>
                                ) : (
                                    <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-500">
                                        Connect
                                    </Button>
                                )}
                            </div>
                        </div>

                        {item.apiKey && (
                            <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">API Key</p>
                                    <div className="flex items-center gap-3 font-mono text-sm">
                                        <span className="text-slate-400 truncate max-w-[200px] md:max-w-none">
                                            {showKey[item.id] ? item.apiKey : "••••••••••••••••••••••••••••"}
                                        </span>
                                        <button
                                            onClick={() => toggleKey(item.id)}
                                            className="text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showKey[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => copyToClipboard(item.apiKey!, item.id)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
                                    >
                                        {copied === item.id ? (
                                            <>
                                                <Check className="w-3 h-3 text-emerald-400" />
                                                <span className="text-emerald-400">Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3 h-3 text-slate-500" />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>
                                    <button className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-colors">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-8 h-8 text-blue-500" />
                </div>
                <div className="space-y-2">
                    <h4 className="text-white font-bold text-lg">Secure Integration Layer</h4>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                        All API keys are encrypted at rest using AES-256 and stored in your dedicated secure vault. No personnel can access these keys directly.
                    </p>
                </div>
                <Button variant="outline" className="whitespace-nowrap ml-auto">
                    Security Whitepaper
                </Button>
            </div>
        </div>
    );
}
