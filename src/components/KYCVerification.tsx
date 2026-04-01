"use client";

import { useState } from "react";
import { ShieldCheck, UserCheck, FileCheck, Upload, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "./ui/Button";
import clsx from "clsx";
import { motion } from "framer-motion";

type StepStatus = "pending" | "completed" | "active" | "error";

interface KYCStep {
    id: number;
    title: string;
    description: string;
    status: StepStatus;
    icon: any;
}

const initialSteps: KYCStep[] = [
    { id: 1, title: "Identity Document", description: "Passport or National ID scan.", status: "completed", icon: UserCheck },
    { id: 2, title: "Liveness Detection", description: "Real-time facial verification.", status: "active", icon: ShieldCheck },
    { id: 3, title: "Proof of Address", description: "Utility bill or bank statement.", status: "pending", icon: FileCheck },
];

export default function KYCVerification() {
    return (
        <div className="space-y-12">
            <div className="bg-card border border-border p-8 rounded-3xl">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <UserCheck className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="text-foreground font-bold text-xl">Verification Status: Tier 1</h3>
                        <p className="text-muted-foreground text-sm">You are currently verified for basic platform features.</p>
                    </div>
                    <div className="ml-auto px-4 py-2 bg-muted border border-border rounded-xl text-xs font-bold text-muted-foreground">
                        PENDING FULL ACCESS
                    </div>
                </div>

                <div className="relative space-y-4">
                    <div className="absolute left-[27px] top-6 bottom-6 w-px bg-border hidden md:block"></div>

                    {initialSteps.map((step, idx) => (
                        <div key={step.id} className="relative flex items-start gap-6 group">
                            <div className={clsx(
                                "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 transition-all",
                                step.status === "completed" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                    step.status === "active" ? "bg-primary/10 text-primary border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)]" :
                                        "bg-muted text-muted-foreground border border-border"
                            )}>
                                <step.icon className="w-7 h-7" />
                            </div>

                            <div className="flex-1 py-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className={clsx(
                                        "font-bold text-lg transition-colors",
                                        step.status === "pending" ? "text-muted-foreground" : "text-foreground"
                                    )}>
                                        {step.title}
                                    </h4>
                                    {step.status === "completed" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                </div>
                                <p className="text-muted-foreground text-sm">{step.description}</p>

                                {step.status === "active" && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mt-6 p-6 bg-muted border border-border rounded-2xl flex flex-col items-center justify-center text-center gap-6"
                                    >
                                        <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center border border-border border-dashed animate-spin-slow">
                                            <Upload className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-foreground text-sm font-bold">Ready for Scanned Document</p>
                                            <p className="text-muted-foreground text-xs">Maximum file size: 10MB (JPG, PNG, PDF)</p>
                                        </div>
                                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                                            Select File
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-border bg-card">
                    <h5 className="text-foreground font-bold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Why verify?
                    </h5>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Full verification (Tier 2) allows for automated legal drafting, API production access, and secure cloud storage exports.
                    </p>
                </div>
                <div className="p-6 rounded-2xl border border-border bg-card">
                    <h5 className="text-foreground font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-widest text-[10px] text-muted-foreground">
                        Help Center
                    </h5>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground flex items-center gap-2 group text-sm transition-colors h-auto p-0 hover:bg-transparent shadow-none"
                        rightIcon={<ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    >
                        Read verification requirements
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground flex items-center gap-2 group text-sm mt-3 transition-colors h-auto p-0 hover:bg-transparent shadow-none"
                        rightIcon={<ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    >
                        Enterprise onboarding guide
                    </Button>
                </div>
            </div>
        </div>
    );
}

