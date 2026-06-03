import clsx from 'clsx';
import Spinner from './Spinner';

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  children,
  ...props
}) {
  const baseClasses =
    'font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center gap-2';

  const variantClasses = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500',
    secondary:
      'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        (disabled || isLoading) && 'opacity-60 cursor-not-allowed',
      )}
      {...props}
    >
      {isLoading && <Spinner className="w-4 h-4" />}
      {children}
    </button>
  );
}
