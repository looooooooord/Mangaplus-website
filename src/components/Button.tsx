import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'outline' | 'danger' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  children?: ReactNode;
}

export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  { fullWidth = false, extra = '' }: { fullWidth?: boolean; extra?: string } = {},
): string {
  return ['btn', `btn--${variant}`, `btn--${size}`, fullWidth ? 'btn--block' : '', extra]
    .filter(Boolean)
    .join(' ');
}

function Inner({
  iconLeft,
  iconRight,
  loading,
  children,
}: Pick<StyleProps, 'iconLeft' | 'iconRight' | 'loading' | 'children'>) {
  return (
    <>
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : null}
      {!loading && iconLeft ? <Icon name={iconLeft} size={18} /> : null}
      <span className="btn__label">{children}</span>
      {!loading && iconRight ? <Icon name={iconRight} size={18} /> : null}
    </>
  );
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & StyleProps
>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    iconLeft,
    iconRight,
    loading = false,
    className = '',
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass(variant, size, { fullWidth, extra: className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <Inner iconLeft={iconLeft} iconRight={iconRight} loading={loading}>
        {children}
      </Inner>
    </button>
  );
});

type ButtonLinkProps = LinkProps & StyleProps;

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  iconLeft,
  iconRight,
  loading = false,
  className = '',
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, { fullWidth, extra: className })} {...rest}>
      <Inner iconLeft={iconLeft} iconRight={iconRight} loading={loading}>
        {children}
      </Inner>
    </Link>
  );
}

type ButtonAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & StyleProps;

export function ButtonAnchor({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  iconLeft,
  iconRight,
  className = '',
  children,
  ...rest
}: ButtonAnchorProps) {
  return (
    <a className={buttonClass(variant, size, { fullWidth, extra: className })} {...rest}>
      <Inner iconLeft={iconLeft} iconRight={iconRight}>
        {children}
      </Inner>
    </a>
  );
}
