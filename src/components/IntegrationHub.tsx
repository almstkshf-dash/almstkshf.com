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
                        className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/30 transition-all"
                    >
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex gap-4">
                                <div className={clsx(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                    item.status === "connected" ? "bg-primary/10 text-primary" : "bg-muted text-foreground/60"
                                )}>
                                    <Key className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-foreground font-bold">{item.name}</h4>
                                        <span className={clsx(
                                            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                            item.status === "connected" ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-border text-foreground/60 bg-muted"
                                        )}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-foreground/70 text-sm mt-1">{item.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {item.status === "connected" ? (
                                    <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive">
                                        Revoke
                                    </Button>
                                ) : (
                                    <Button variant="primary" size="sm" className="bg-primary hover:bg-primary/90">
                                        Connect
                                    </Button>
                                )}
                            </div>
                        </div>

                        {item.apiKey && (
                            <div className="px-6 py-4 bg-muted/50 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 mb-2">API Key</p>
                                    <div className="flex items-center gap-3 font-mono text-sm">
                                        <span className="text-foreground/60 truncate max-w-[200px] md:max-w-none">
                                            {showKey[item.id] ? item.apiKey : "••••••••••••••••••••••••••••"}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleKey(item.id)}
                                            className="text-foreground/60 hover:text-foreground transition-colors h-auto p-0 hover:bg-transparent shadow-none"
                                        >
                                            {showKey[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(item.apiKey!, item.id)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-foreground/70 text-xs font-semibold hover:bg-muted transition-colors h-auto shadow-none"
                                        leftIcon={copied === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-foreground/60" />}
                                    >
                                        {copied === item.id ? (
                                            <span className="text-emerald-400">Copied</span>
                                        ) : (
                                            <span>Copy</span>
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="p-1.5 rounded-lg bg-card border border-border text-foreground/60 hover:text-foreground hover:bg-muted transition-colors h-8 w-8 shadow-none"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="p-8 rounded-3xl border border-border bg-card flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                    <h4 className="text-foreground font-bold text-lg">Secure Integration Layer</h4>
                    <p className="text-foreground/70 text-sm leading-relaxed max-w-xl">
                        All API keys are encrypted at rest using AES-256 and stored in your dedicated secure vault. No personnel can access these keys directly.
                    </p>
                </div>
                <Button variant="outline" className="whitespace-nowrap ml-auto bg-card text-foreground border-border hover:bg-muted">
                    Security Whitepaper
                </Button>
            </div>
        </div>
    );
}

