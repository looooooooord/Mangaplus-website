import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Icon } from './Icon';
import { Logo } from './Logo';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('Unhandled UI error', error, info.componentStack);
    }
  }

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="status-page">
        <div className="status-page__card">
          <Logo size="md" to={null} />
          <span className="status-page__icon status-page__icon--error" aria-hidden="true">
            <Icon name="alert" size={30} />
          </span>
          <h1 className="status-page__title">حدث خطأ غير متوقع</h1>
          <p className="status-page__text">
            لم تكتمل الصفحة كما ينبغي. يمكنك إعادة المحاولة، أو العودة إلى الصفحة الرئيسية ومتابعة
            التصفح.
          </p>
          <div className="status-page__actions">
            <Button onClick={this.reload} iconLeft="refresh">
              إعادة المحاولة
            </Button>
            <Link className="btn btn--outline btn--md" to="/">
              <span className="btn__label">الصفحة الرئيسية</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
