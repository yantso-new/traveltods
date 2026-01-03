import React from 'react';
import { Loader2 } from 'lucide-react';

export const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none border-stone-100 bg-sky-50 text-sky-700 hover:bg-sky-100 ${className}`}>
    {children}
  </span>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' }> = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";

  const variants = {
    primary: "bg-rose-400 text-white hover:bg-rose-500 shadow-sm hover:shadow-md",
    outline: "border border-stone-200 bg-white hover:bg-stone-50 text-stone-600",
    ghost: "hover:bg-stone-100 text-stone-600"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`rounded-2xl border border-stone-100 bg-white text-stone-900 shadow-sm transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-rose-100 hover:shadow-md' : ''} ${className}`}
  >
    {children}
  </div>
);

export const ProgressBar: React.FC<{ value: number; max?: number; label?: string; icon?: React.ReactNode; color?: string }> = ({
  value,
  max = 10,
  label,
  icon,
  color = "bg-rose-400"
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between mb-2 items-center">
        <span className="text-sm font-medium text-stone-600 flex items-center gap-2">
          {icon && <span className="text-stone-300">{icon}</span>}
          {label}
        </span>
        <span className="text-xs font-bold text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full">{value}/{max}</span>
      </div>
      <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-rose-300" />
  </div>
);

export const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <div className="pointer-events-none absolute bottom-full mb-2 hidden w-48 -translate-x-1/2 rounded-lg bg-stone-800 p-2 text-center text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100 z-50 left-1/2">
        {content}
        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-stone-800"></div>
      </div>
    </div>
  );
};