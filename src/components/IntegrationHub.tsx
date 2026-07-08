/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Key, Shield, RefreshCw, Eye, EyeOff, Check, Copy } from "lucide-react";
import Button from "./ui/Button";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserIntegration } from "@/types/integration";

export default function IntegrationHub() {
    const initialIntegrationsData = useQuery(api.integrations.getUserIntegrations);
    const [integrations, setIntegrations] = useState<UserIntegration[]>([]);
    const [showKey, setShowKey] = useState<Record<string, boolean>>({});
    const [copied, setCopied] = useState<string | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (initialIntegrationsData) {
            setIntegrations(initialIntegrationsData as UserIntegration[]);
        }
    }, [initialIntegrationsData]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const toggleKey = (id: string) => {
        setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = async (key: string, id: string) => {
        try {
            await navigator.clipboard.writeText(key);
            setCopied(id);
        } catch (err) {
            console.error("Clipboard write failed:", err);
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => setCopied(null), 2000);
    };

    const revokeIntegration = (id: string) => {
        if (window.confirm("Are you sure you want to revoke this integration? This will immediately disable and reset your credentials.")) {
            setIntegrations(prev =>
                prev.map(item =>
                    item.id === id
                        ? { ...item, status: "disconnected", apiKey: undefined }
                        : item
                )
            );
        }
    };

    const connectIntegration = (id: string) => {
        setIntegrations(prev =>
            prev.map(item =>
                item.id === id
                    ? {
                          ...item,
                          status: "connected",
                          apiKey:
                              id === "1"
                                  ? "mk_live_••••••••••••••••"
                                  : id === "2"
                                  ? "lc_prod_••••••••••••••••"
                                  : "sa_webhook_••••••••••••••••",
                      }
                    : item
            )
        );
    };

    const rotateApiKey = (id: string) => {
        if (window.confirm("Are you sure you want to rotate this API key? Any systems using the old key will lose access immediately.")) {
            setIntegrations(prev =>
                prev.map(item =>
                    item.id === id
                        ? {
                              ...item,
                              apiKey:
                                  id === "1"
                                      ? "mk_live_rotated_••••••••••••••••"
                                      : "lc_prod_rotated_••••••••••••••••",
                          }
                        : item
                )
            );
        }
    };

    if (initialIntegrationsData === undefined) {
        return (
            <div className="flex h-[30vh] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
                {integrations.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
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
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => revokeIntegration(item.id)}
                                        className="text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive"
                                    >
                                        Revoke
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="sm"
                                        onClick={() => connectIntegration(item.id)}
                                        className="bg-primary hover:bg-primary/90"
                                    >
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
                                            {showKey[item.id] ? item.apiKey : "••••••••••••••••••••"}
                                        </span>
                                        <Button
                                            type="button"
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
                                        type="button"
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
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => rotateApiKey(item.id)}
                                        aria-label="Rotate API key"
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
                <Button
                    type="button"
                    variant="outline"
                    className="whitespace-nowrap ml-auto bg-card text-foreground border-border hover:bg-muted"
                >
                    Security Whitepaper
                </Button>
            </div>
        </div>
    );
}
