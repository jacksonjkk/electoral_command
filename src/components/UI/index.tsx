import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'futuristic-btn font-bold rounded-xl transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-2 shadow-sm';

    const variantStyles = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-neon-primary border border-primary-500/50',
      secondary:
        'bg-white/10 backdrop-blur-md text-gray-900 border border-gray-200 hover:bg-white/20',
      danger: 'bg-danger-500 text-white hover:bg-danger-600 hover:shadow-neon-danger border border-danger-400/50',
      success:
        'bg-success-500 text-white hover:bg-success-600 hover:shadow-neon-success border border-success-400/50',
    };

    const sizeStyles = {
      sm: 'px-4 py-2',
      md: 'px-6 py-3',
      lg: 'px-8 py-4',
    };

    return (
      <button
        ref={ref}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="relative w-5 h-5">
              <div className="absolute inset-0 bg-white/40 blur-md rounded-full animate-pulse" />
              <img src="/loader.png" alt="Loading" className="w-full h-full object-contain relative z-10 animate-spin-slow" />
            </div>
            <span>Syncing...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            className={clsx(
              'w-full px-5 py-3 bg-white/50 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-medium placeholder:text-gray-400',
              error ? 'border-danger-500/50 focus:border-danger-500' : 'border-gray-100 group-hover:border-primary-200 focus:border-primary-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-danger-500 text-[10px] font-bold mt-1.5 ml-1">{error}</p>}
        {helperText && !error && (
          <p className="text-gray-400 text-[10px] font-medium mt-1.5 ml-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            'w-full px-5 py-3 bg-white/50 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-medium placeholder:text-gray-400 min-h-[120px]',
            error ? 'border-danger-500/50 focus:border-danger-500' : 'border-gray-100 focus:border-primary-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-danger-500 text-[10px] font-bold mt-1.5 ml-1">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options = [], className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={clsx(
            'w-full px-5 py-3 bg-white/50 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-medium',
            error ? 'border-danger-500/50 focus:border-danger-500' : 'border-gray-100 focus:border-primary-500',
            className
          )}
          {...props}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-danger-500 text-[10px] font-bold mt-1.5 ml-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'glass' | 'dark' | 'outline';
}

export const Card = ({ children, className, onClick, variant = 'glass' }: CardProps) => (
  <div
    className={clsx(
      variant === 'glass' && 'glass-card',
      variant === 'dark' && 'glass-card-dark',
      variant === 'outline' && 'border-2 border-gray-100 rounded-2xl bg-white/30',
      'p-4 md:p-6 transition-all duration-300',
      onClick && 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98]',
      className
    )}
    onClick={onClick}
  >
    {children}
  </div>
);

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert = ({
  variant = 'info',
  title,
  message,
  onClose,
  className,
}: AlertProps) => {
  const styles = {
    success: 'bg-success-500/10 text-success-700 border-success-500/20',
    error: 'bg-danger-500/10 text-danger-700 border-danger-500/20',
    warning: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
    info: 'bg-primary-500/10 text-primary-700 border-primary-500/20',
  };

  return (
    <div
      className={clsx(
        'backdrop-blur-md border-2 rounded-2xl p-5 flex justify-between items-center shadow-lg',
        styles[variant],
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className={clsx('w-1.5 h-8 rounded-full',
          variant === 'success' ? 'bg-success-500' :
            variant === 'error' ? 'bg-danger-500' :
              variant === 'warning' ? 'bg-yellow-500' : 'bg-primary-500'
        )} />
        <div>
          {title && <h4 className="text-xs font-black uppercase tracking-widest mb-0.5">{title}</h4>}
          <p className="text-sm font-semibold">{message}</p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-xl font-bold opacity-70"
        >
          ×
        </button>
      )}
    </div>
  );
};

export const Loading = ({ message = 'Syncing encrypted data...' }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] w-full py-12">
    <div className="relative group">
      {/* Background Glows */}
      <div className="absolute inset-0 rounded-full blur-3xl bg-primary-500/20 animate-pulse scale-150" />
      <div className="absolute inset-0 rounded-full blur-2xl bg-accent-cyan/10 animate-glow" />

      {/* Custom Loader Image */}
      <div className="relative w-24 h-24 md:w-32 md:h-32 p-4 bg-white/40 backdrop-blur-xl rounded-[40px] border border-white/60 shadow-2xl flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-transparent" />
        <img
          src="/loader.png"
          alt="Loading..."
          className="w-full h-full object-contain relative z-10 animate-spin-slow"
        />
      </div>
    </div>
    <div className="mt-12 text-center">
      <p className="text-primary-900 font-black text-[10px] md:text-xs uppercase tracking-[0.5em] animate-pulse">
        {message}
      </p>
      <div className="flex justify-center gap-1 mt-4">
        <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" />
      </div>
    </div>
  </div>
);

export interface EmptyStateProps {
  icon?: React.ReactNode | string;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  message,
  action,
  className,
}: EmptyStateProps) => (
  <Card variant="outline" className={clsx("flex flex-col items-center justify-center py-20 text-center", className)}>
    {icon && <div className="mb-6 scale-150 drop-shadow-xl">{icon}</div>}
    <h3 className="text-2xl font-black text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">{message}</p>
    {action && (
      <Button variant="secondary" onClick={action.onClick} size="lg" className="!rounded-2xl border-2 border-gray-100">{action.label}</Button>
    )}
  </Card>
);

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={clsx("animate-pulse bg-gray-200/60 rounded-xl", className)} />
);

export const ElectionSkeleton = () => (
  <div className="glass-card p-6 border-2 border-gray-100 rounded-2xl">
    <div className="flex justify-between items-start mb-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-2/3 mb-6" />
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-28 rounded-xl" />
    </div>
  </div>
);

