import React from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
    size?: "sm" | "md" | "lg";
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
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50",
        secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
        ghost: "bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white",
        outline: "bg-transparent border border-slate-600 hover:border-blue-400 text-slate-300 hover:text-blue-400",
        danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/30",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-7 py-3.5 text-base",
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
