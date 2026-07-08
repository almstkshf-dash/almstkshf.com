/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import Button, { ButtonProps } from './Button';
import Dialog from './Dialog';
import { useTranslations } from 'next-intl';

type DialogVariant = Extract<ButtonProps['variant'], 'danger' | 'primary'> | 'warning';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<unknown> | unknown;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: DialogVariant;
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
    const id = React.useId();
    const [localLoading, setLocalLoading] = useState(false);

    const loading = isLoading || localLoading;

    const Icon = variant === 'danger' ? AlertTriangle : variant === 'warning' ? AlertCircle : Info;

    const handleConfirm = async () => {
        if (loading) return;
        try {
            const result = onConfirm();
            if (result instanceof Promise) {
                setLocalLoading(true);
                await result;
            }
        } catch (error) {
            console.error('ConfirmationDialog error during onConfirm:', error);
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            isLoading={loading}
            ariaLabelledBy={`${id}-title`}
            ariaDescribedBy={`${id}-description`}
            role="alertdialog"
        >
            <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        className={`p-3 rounded-2xl ${variant === 'danger' ? 'bg-status-error-bg text-status-error-fg border border-status-error-fg/20' :
                            variant === 'warning' ? 'bg-status-warning-bg text-status-warning-fg border border-status-warning-fg/20' :
                                'bg-primary/15 text-primary dark:text-blue-300 border border-primary/20 transition-colors'
                            }`}
                    >
                        <Icon className="w-6 h-6" />
                    </motion.div>
                    <button
                        onClick={() => !loading && onClose()}
                        disabled={loading}
                        aria-label={t('cancel')}
                        className="p-2 rounded-xl border border-border hover:bg-muted text-foreground/60 transition-all disabled:opacity-50"
                    >
                        <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>

                <div className="space-y-2">
                    <h3 id={`${id}-title`} className="text-xl font-bold tracking-tight text-foreground">
                        {title}
                    </h3>
                    <p id={`${id}-description`} className="text-sm text-foreground/70 leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
                    <Button
                        variant="ghost"
                        className="w-full sm:flex-1 h-12 rounded-2xl border border-border hover:bg-muted"
                        onClick={() => !loading && onClose()}
                        disabled={loading}
                    >
                        {cancelLabel || t('cancel')}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : variant === 'warning' ? 'secondary' : 'primary'}
                        className="w-full sm:flex-1 h-12 rounded-2xl"
                        onClick={handleConfirm}
                        isLoading={loading}
                    >
                        {confirmLabel || t('confirm')}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}
