import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service in production
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;
      const isNetworkError = this.state.error?.message?.includes('fetch') || 
                            this.state.error?.message?.includes('network');

      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-blue-600 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center">
            <div className="text-6xl mb-6">😅</div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Oops! Something went wrong
            </h1>
            
            <div className="mb-6">
              {isNetworkError ? (
                <div className="bg-orange-500/20 border border-orange-500/30 rounded-2xl p-4 mb-4">
                  <p className="text-orange-200 text-sm">
                    🌐 Network connection issue detected. Please check your internet connection.
                  </p>
                </div>
              ) : (
                <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-4">
                  <p className="text-red-200 text-sm">
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    An unexpected error occurred while loading the application.
                  </p>
                </div>
              )}
              
              <p className="text-white/80 text-sm">
                Don't worry! Your travel plans are safe. Try refreshing the page or contact support if the problem persists.
              </p>
            </div>

            <div className="space-y-3">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                  aria-label="Retry loading the application"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Try Again ({this.maxRetries - this.state.retryCount} attempts left)</span>
                </button>
              )}
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-gradient-to-r from-green-500/20 to-teal-500/20 hover:from-green-500/30 hover:to-teal-500/30 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                aria-label="Go back to home page"
              >
                <Home className="w-5 h-5" />
                <span>Go Home</span>
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-200"
                aria-label="Refresh the page"
              >
                Refresh Page
              </button>
            </div>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-white/80 cursor-pointer hover:text-white transition-colors text-sm">
                  Show Error Details
                </summary>
                <div className="mt-3 p-4 bg-black/20 rounded-xl text-xs text-white/70 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/60 text-xs">
                Need help? Contact support at{' '}
                <a 
                  href="mailto:support@wanderlust-ai.com" 
                  className="text-blue-300 hover:text-blue-200 underline"
                  aria-label="Contact support via email"
                >
                  support@wanderlust-ai.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;