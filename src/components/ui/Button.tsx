import React from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export default function Button({
    children,
    className,
    variant = "primary",
    size = "md",
    isLoading,
    leftIcon,
    rightIcon,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
        primary: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 border border-blue-400/20",
        secondary: "bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border bg-white dark:bg-slate-900",
        ghost: "bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground",
        outline: "bg-transparent border border-border hover:border-primary text-muted-foreground hover:text-primary",
        danger: "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/30",
    };

    const sizes = {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-2.5 text-sm",
        lg: "px-8 py-3.5 text-base",
        icon: "h-11 w-11 p-0",
    };

    return (
        <button
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {!isLoading && leftIcon && <span className="mr-2 rtl:ml-2 rtl:mr-0">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="ml-2 rtl:mr-2 rtl:ml-0">{rightIcon}</span>}
        </button>
    );
}
