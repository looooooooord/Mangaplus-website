import { useId, type SelectHTMLAttributes } from 'react';
import { Icon } from './Icon';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  options: SelectOption[];
  hideLabel?: boolean;
}

export function Select({ label, options, hideLabel = true, className = '', ...rest }: SelectProps) {
  const id = useId();
  return (
    <div className={`select ${className}`.trim()}>
      <label className={hideLabel ? 'sr-only' : 'select__label'} htmlFor={id}>
        {label}
      </label>
      <div className="select__control">
        <select id={id} className="select__input" {...rest}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" size={16} className="select__chevron" />
      </div>
    </div>
  );
}
