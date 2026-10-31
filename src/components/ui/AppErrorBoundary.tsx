import { Component, type ReactNode } from "react";

import ErrorFallback from "./ErrorFallback";
import { normalizeError, reportError } from "../../utils/generalUtils";

type AppErrorBoundaryProps = { children: ReactNode };
type AppErrorBoundaryState = { hasError: boolean };

class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    reportError(normalizeError(error));
  }

  render() {
    return this.state.hasError ? <ErrorFallback /> : this.props.children;
  }
}

export default AppErrorBoundary;
