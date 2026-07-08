/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInertBackground } from '@/hooks/useInertBackground';

export interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
    isLoading?: boolean;
    role?: 'dialog' | 'alertdialog';
}

export default function Dialog({
    isOpen,
    onClose,
    children,
    className = "relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl shadow-primary/5 overflow-hidden",
    ariaLabelledBy,
    ariaDescribedBy,
    isLoading = false,
    role = 'dialog',
}: DialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLElement | null>(null);

    // Apply `inert` to background content & lock scroll when open.
    // This replaces `aria-hidden="true"` to prevent the focus-trap violation
    // when a focused child (e.g. Clerk UserButton) is inside a hidden ancestor.
    useInertBackground(isOpen, dialogRef);

    // Keyboard: close on Escape
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isLoading) {
            onClose();
        }
    }, [onClose, isLoading]);

    useEffect(() => {
        if (!isOpen) return;
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleKeyDown]);

    // Focus management (focus on open, restore on close)
    useEffect(() => {
        if (isOpen) {
            triggerRef.current = document.activeElement as HTMLElement;

            const focusTimeout = setTimeout(() => {
                if (dialogRef.current) {
                    dialogRef.current.focus();
                }
            }, 0);

            return () => {
                clearTimeout(focusTimeout);
                // Restore focus to original active element
                triggerRef.current?.focus();
            };
        }
    }, [isOpen]);

    // Focus trap implementation
    const handleTabKey = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== 'Tab' || !dialogRef.current) return;

        const focusableSelectors = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusableElements = dialogRef.current.querySelectorAll(focusableSelectors);

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement || document.activeElement === dialogRef.current) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }, []);

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
                        ref={dialogRef}
                        tabIndex={-1}
                        onKeyDown={handleTabKey}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 400,
                            mass: 0.8
                        }}
                        role={role}
                        aria-modal="true"
                        aria-labelledby={ariaLabelledBy}
                        aria-describedby={ariaDescribedBy}
                        className={className}
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
