'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import Button from './Button';
import { useTranslations } from 'next-intl';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'primary';
    isLoading?: boolean;
}

export default function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel,
    cancelLabel,
    variant = 'danger',
    isLoading = false,
}: ConfirmationDialogProps) {
    const t = useTranslations('Common');

    const Icon = variant === 'danger' ? AlertTriangle : variant === 'warning' ? AlertCircle : Info;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isLoading ? onClose : undefined}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Dialog Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 400,
                            mass: 0.8
                        }}
                        className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl shadow-primary/5 overflow-hidden"
                    >
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="flex items-start justify-between gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                                    transition={{ duration: 0.4 }}
                                    className={`p-3 rounded-2xl ${variant === 'danger' ? 'bg-status-error-bg text-status-error-fg border border-status-error-fg/20' :
                                        variant === 'warning' ? 'bg-status-warning-bg text-status-warning-fg border border-status-warning-fg/20' :
                                            'bg-primary/15 text-primary dark:text-blue-300 border border-primary/20 transition-colors'
                                        }`}>
                                    <Icon className="w-6 h-6" />
                                </motion.div>
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-all disabled:opacity-50"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold tracking-tight text-foreground">{title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                                <Button
                                    variant={variant === 'danger' ? 'danger' : variant === 'warning' ? 'secondary' : 'primary'}
                                    className="w-full sm:flex-1 h-12 rounded-2xl"
                                    onClick={onConfirm}
                                    isLoading={isLoading}
                                >
                                    {confirmLabel || t('confirm')}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full sm:flex-1 h-12 rounded-2xl border border-border hover:bg-muted"
                                    onClick={onClose}
                                    disabled={isLoading}
                                >
                                    {cancelLabel || t('cancel')}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
