import { Component, type ErrorInfo, type ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches rendering failures so a single broken view never leaves the user with
 * a blank page. Generation errors from the API are handled inline instead.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-4 py-20 sm:px-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-critical/30 bg-critical-soft text-critical">
          <CircleAlert className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-ink">Something went wrong in the interface</h1>
          <p className="text-sm leading-relaxed text-ink-muted">
            Your files were not sent anywhere. Reload the page to continue — if the problem persists, report it with the
            steps you took.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reload page
          </Button>
          <Button variant="secondary" onClick={this.reset}>
            Try again
          </Button>
        </div>
      </div>
    );
  }
}
