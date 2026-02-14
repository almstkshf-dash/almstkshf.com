import React from "react";
import clsx from "clsx";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useTranslations } from "next-intl";

interface CrisisPlanCardProps {
    title: string;
    priority: "Low" | "Medium" | "High";
    actions: string[];
    status: string;
}

export default function CrisisPlanCard({ title, priority, actions, status }: CrisisPlanCardProps) {
    const t = useTranslations("CrisisManagementDetail.card");

    const priorityColors = {
        Low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        Medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        High: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    };

    const statusIcons = {
        Low: CheckCircle,
        Medium: Info,
        High: AlertTriangle,
    };

    const Icon = statusIcons[priority];

    return (
        <div className={clsx("p-5 rounded-xl border transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md", priorityColors[priority])}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={clsx("p-2 rounded-lg bg-background/30 backdrop-blur-sm transition-colors")}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-foreground transition-colors">{title}</h3>
                        <span className="text-xs font-mono uppercase tracking-wider opacity-80">{priority} {t('priority')}</span>
                    </div>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground border border-border transition-colors">
                    {status}
                </span>
            </div>

            <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase opacity-70 transition-colors">{t('action_protocol')}</div>
                <ul className="space-y-1">
                    {actions.map((action, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2 transition-colors">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-current opacity-50" />
                            {action}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
