import React, { useRef, useId, forwardRef } from 'react';
import { useTrapFocus, useAriaAnnounce } from '@/hooks/accessibility';

interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

interface DialogProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
}

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  ({ isOpen, onClose, title, description, children, className = '' }, ref) => {
    const dialogRef = useTrapFocus({ isActive: isOpen });
    const titleId = useId();
    const descriptionId = useId();

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-contain ${className}`}
      >
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
        <div
          ref={dialogRef}          className="max-h-[85vh] overflow-y-auto overscroll-contain rounded-lg bg-white dark:bg-gray-800 border border-[var(--gold-primary)] p-6 relative z-10 shadow-xl w-full max-w-md"
        >
          <h2 id={titleId} className="text-xl font-semibold mb-4">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="text-gray-600 dark:text-gray-300 mb-4">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    );
  }
);
Dialog.displayName = 'Dialog';

interface ToastProps extends BaseProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export const Toast = ({ type, message, className = '' }: ToastProps) => {
  const { announce, announceRef } = useAriaAnnounce();

  React.useEffect(() => {
    announce(message);
  }, [message, announce]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100';
      case 'error':
        return 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
    }
  };

  return (
    <>
      <div
        role="alert"
        className={`rounded-lg p-4 ${getTypeStyles()} ${className}`}
      >
        {message}
      </div>
      <div
        ref={announceRef}
        role="status"
        aria-live="polite"
        className="sr-only"
      />
    </>
  );
};

interface TabsProps extends BaseProps {
  items: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  defaultTabId?: string;
}

export const Tabs = ({ items, defaultTabId, className = '' }: TabsProps) => {
  const [activeId, setActiveId] = React.useState(defaultTabId || items[0]?.id);

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Content tabs"
        className="flex border-b border-gray-200 dark:border-gray-700"
      >
        {items.map(item => (
          <button
            key={item.id}
            role="tab"
            aria-selected={activeId === item.id}
            aria-controls={`tabpanel-${item.id}`}
            id={`tab-${item.id}`}
            tabIndex={activeId === item.id ? 0 : -1}
            onClick={() => setActiveId(item.id)}
            className={`px-4 py-2 border-b-2 -mb-px ${
              activeId === item.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map(item => (
        <div
          key={item.id}
          role="tabpanel"
          id={`tabpanel-${item.id}`}
          aria-labelledby={`tab-${item.id}`}
          hidden={activeId !== item.id}
          className="pt-4"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
};

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  error?: string;
  onChange: (value: string) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, onChange, id: propId, className = '', ...props }, ref) => {
    const id = useId();
    const finalId = propId || id;
    const errorId = useId();

    return (
      <div className={className}>
        <label
          htmlFor={finalId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={finalId}
          onChange={e => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`block w-full rounded-md border-gray-300 dark:border-gray-600 
            shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 
            dark:text-white sm:text-sm ${error ? 'border-red-300' : ''}`}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

interface LoadingProps extends BaseProps {
  text?: string;
}

export const Loading = ({ text = 'Loading...', className = '' }: LoadingProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center ${className}`}
    >
      <div className="animate-spin h-5 w-5 mr-3 border-2 border-gray-500 border-t-transparent rounded-full" />
      <span>{text}</span>
    </div>
  );
};
