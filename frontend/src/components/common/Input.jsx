import { cn } from '../../utils/helpers';

function Input({ label, error, id, type = 'text', className, icon, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-surface-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">
            {icon}
          </span>
        )}
        <input
          type={type}
          id={id}
          className={cn(
            'input-field',
            icon && 'pl-10',
            error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}

export default Input;
