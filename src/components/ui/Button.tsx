import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyles = "px-6 py-3 rounded-xl font-medium transition-all duration-300 transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

    const variants = {
        primary: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/30 focus:ring-indigo-500 border border-transparent hover:shadow-indigo-500/50",
        secondary: "bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-sm focus:ring-slate-200 hover:border-slate-300",
        outline: "bg-transparent border-2 border-indigo-600/20 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-600/40 focus:ring-indigo-500",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-200"
    };

    const widthStyles = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${widthStyles} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
