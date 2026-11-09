import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon } from './Icon';

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  hint?: string;
  error?: string;
  icon?: 'mail' | 'lock' | 'user' | 'search';
  trailing?: ReactNode;
}

export function FormField({
  label,
  hint,
  error,
  icon,
  trailing,
  type = 'text',
  className = '',
  ...rest
}: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && visible ? 'text' : type;

  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`.trim()}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__control">
        {icon ? (
          <span className="field__icon" aria-hidden="true">
            <Icon name={icon} size={18} />
          </span>
        ) : null}
        <input
          id={id}
          type={inputType}
          className={`field__input ${icon ? 'field__input--with-icon' : ''}`.trim()}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            className="field__toggle"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            aria-pressed={visible}
            tabIndex={0}
          >
            <Icon name={visible ? 'eyeOff' : 'eye'} size={18} />
          </button>
        ) : (
          trailing
        )}
      </div>
      {error ? (
        <p className="field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
