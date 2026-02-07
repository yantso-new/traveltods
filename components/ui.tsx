import React from 'react';
import { Loader2 } from 'lucide-react';

export const Badge: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'solid-primary' | 'solid-secondary' | 'solid-accent' | 'gradient-primary' | 'gradient-secondary' | 'gradient-accent' | 'subtle-primary' | 'subtle-secondary' | 'subtle-accent';
}> = ({ children, className = '', variant = 'solid-primary' }) => {
  const variants = {
    // Solid variants - high visibility with glassmorphism
    'solid-primary': 'bg-primary text-white shadow-lg shadow-primary/30 backdrop-blur-md border border-white/20',
    'solid-secondary': 'bg-secondary text-white shadow-lg shadow-secondary/30 backdrop-blur-md border border-white/20',
    'solid-accent': 'bg-accent text-accent-foreground shadow-lg shadow-accent/40 backdrop-blur-md border border-white/20',

    // Gradient variants - premium feel
    'gradient-primary': 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/40 border border-white/10',
    'gradient-secondary': 'bg-gradient-to-r from-secondary to-teal-500 text-white shadow-lg shadow-secondary/40 border border-white/10',
    'gradient-accent': 'bg-gradient-to-r from-amber-400 to-accent text-accent-foreground shadow-lg shadow-accent/50 border border-white/10',

    // Subtle variants - for less critical info
    'subtle-primary': 'bg-primary/10 text-primary border-primary/20',
    'subtle-secondary': 'bg-secondary/10 text-secondary border-secondary/20',
    'subtle-accent': 'bg-accent/10 text-accent-foreground border-accent/20',
  };

  return (
    <span className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-extrabold transition-all duration-200 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'secondary' }> = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-2xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-11 px-6";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-dark shadow-lg shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md active:shadow-sm",
    outline: "border border-slate-200 bg-surface-light hover:bg-muted text-text-main-light active:bg-slate-100",
    ghost: "hover:bg-muted text-text-sub-light active:bg-slate-200"
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
        <span className="text-xs font-bold text-text-sub-light bg-muted px-2 py-0.5 rounded-full">{value}/{max}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
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
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

export const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <div className="pointer-events-none absolute bottom-full mb-2 hidden w-48 -translate-x-1/2 rounded-lg bg-background-dark p-2 text-center text-xs text-text-main-dark opacity-0 shadow-lg transition-opacity duration-200 group-hover:block group-hover:opacity-100 z-50 left-1/2">
        {content}
        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-background-dark"></div>
      </div>
    </div>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input
    className={`flex h-12 w-full rounded-xl border border-slate-200 bg-surface-light px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-sub-light/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-primary/30 ${className}`}
    {...props}
  />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-surface-light px-4 py-3 text-sm ring-offset-background placeholder:text-text-sub-light/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-primary/30 resize-none ${className}`}
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
    className={`peer h-5 w-5 shrink-0 rounded-lg border border-slate-200 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground accent-primary cursor-pointer transition-all duration-200 hover:border-primary/50 ${className}`}
    {...props}
  />
);