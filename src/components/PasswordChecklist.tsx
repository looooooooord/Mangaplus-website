import { Icon } from './Icon';

export interface PasswordChecks {
  length: boolean;
  letter: boolean;
  number: boolean;
}

export function passwordChecks(value: string): PasswordChecks {
  return {
    length: value.length >= 8,
    letter: /[A-Za-z\u0600-\u06FF]/.test(value),
    number: /\d/.test(value),
  };
}

export function isPasswordValid(value: string): boolean {
  const checks = passwordChecks(value);
  return checks.length && checks.letter && checks.number;
}

export function passwordStrength(value: string): number {
  const checks = passwordChecks(value);
  const base = [checks.length, checks.letter, checks.number].filter(Boolean).length;
  return value.length >= 12 && base === 3 ? 4 : base;
}

export function PasswordChecklist({ value }: { value: string }) {
  const checks = passwordChecks(value);
  const items = [
    { key: 'length', label: '٨ أحرف على الأقل', met: checks.length },
    { key: 'letter', label: 'حرف واحد على الأقل', met: checks.letter },
    { key: 'number', label: 'رقم واحد على الأقل', met: checks.number },
  ];

  return (
    <ul className="password-checks" aria-label="شروط كلمة المرور">
      {items.map((item) => (
        <li key={item.key} className={item.met ? 'is-met' : ''}>
          <Icon name={item.met ? 'checkCircle' : 'info'} size={14} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
