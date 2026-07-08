/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import React from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

const variants = {
    primary: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 border border-primary/20",
    secondary: "bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border",
    ghost: "bg-transparent hover:bg-muted text-foreground/70 hover:text-foreground",
    outline: "bg-transparent border border-border hover:border-primary text-foreground/70 hover:text-primary",
    danger: "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/30",
} satisfies Record<NonNullable<ButtonProps["variant"]>, string>;

const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
    icon: "h-11 w-11 p-0",
} satisfies Record<NonNullable<ButtonProps["size"]>, string>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            className,
            variant = "primary",
            size = "md",
            isLoading = false,
            leftIcon,
            rightIcon,
            disabled,
            type = "button",
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                type={type}
                aria-busy={isLoading}
                disabled={isLoading || disabled}
                className={clsx(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            >
                {(isLoading || leftIcon) && (
                    <span className="me-2 inline-flex items-center justify-center">
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            leftIcon
                        )}
                    </span>
                )}
                {children}
                {!isLoading && rightIcon && (
                    <span className="ms-2 inline-flex items-center justify-center">
                        {rightIcon}
                    </span>
                )}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;
