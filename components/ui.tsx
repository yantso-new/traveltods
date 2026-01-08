import React from 'react';
import { Loader2 } from 'lucide-react';

export const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors focus:outline-none border-transparent bg-secondary/10 text-secondary-dark ${className}`}>
    {children}
  </span>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'secondary' }> = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-11 px-6";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-dark shadow-lg shadow-primary/30 hover:-translate-y-0.5",
    secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-md",
    outline: "border border-slate-200 bg-surface-light hover:bg-slate-50 text-text-main-light",
    ghost: "hover:bg-slate-100 text-text-sub-light"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; noHoverLift?: boolean }> = ({ children, className = '', onClick, noHoverLift = false }) => (
  <div
    onClick={onClick}
    className={`rounded-3xl border-2 border-transparent bg-surface-light text-text-main-light shadow-lg transition-all duration-300 ${onClick ? `cursor-pointer hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 ${noHoverLift ? '' : 'hover:-translate-y-2'}` : ''} ${className}`}
  >
    {children}
  </div>
);

export const ProgressBar: React.FC<{ value: number; max?: number; label?: string; icon?: React.ReactNode; color?: string }> = ({
  value,
  max = 10,
  label,
  icon,
  color = "bg-primary"
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between mb-2 items-center">
        <span className="text-sm font-medium text-text-sub-light flex items-center gap-2">
          {icon && <span className="opacity-70">{icon}</span>}
          {label}
        </span>
        <span className="text-xs font-bold text-text-sub-light bg-slate-100 px-2 py-0.5 rounded-full">{value}/{max}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
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

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input
    className={`flex h-12 w-full rounded-xl border border-slate-200 bg-surface-light px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-sub-light/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-slate-300 ${className}`}
    {...props}
  />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-surface-light px-4 py-3 text-sm ring-offset-background placeholder:text-text-sub-light/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-slate-300 resize-none ${className}`}
    {...props}
  />
);

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className = '', ...props }) => (
  <label
    className={`text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text-main-light mb-2 block ${className}`}
    {...props}
  />
);

export const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input
    type="checkbox"
    className={`peer h-5 w-5 shrink-0 rounded-md border border-slate-200 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground accent-primary cursor-pointer transition-all ${className}`}
    {...props}
  />
);