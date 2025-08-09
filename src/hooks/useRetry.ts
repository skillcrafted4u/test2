import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
}

interface RetryState {
  isRetrying: boolean;
  attempt: number;
  error: Error | null;
}

export function useRetry<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: RetryOptions = {}
) {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 'exponential',
    onRetry
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    error: null
  });

  const executeWithRetry = useCallback(async (...args: T): Promise<R> => {
    setState({ isRetrying: false, attempt: 0, error: null });

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setState(prev => ({ ...prev, attempt, isRetrying: attempt > 1 }));
        
        const result = await fn(...args);
        
        setState({ isRetrying: false, attempt, error: null });
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        
        setState(prev => ({ ...prev, error: err }));
        
        if (attempt === maxAttempts) {
          setState(prev => ({ ...prev, isRetrying: false }));
          throw err;
        }

        // Calculate delay based on backoff strategy
        const currentDelay = backoff === 'exponential' 
          ? delay * Math.pow(2, attempt - 1)
          : delay * attempt;

        onRetry?.(attempt, err);

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, currentDelay));
      }
    }

    throw new Error('Max retry attempts reached');
  }, [fn, maxAttempts, delay, backoff, onRetry]);

  const reset = useCallback(() => {
    setState({ isRetrying: false, attempt: 0, error: null });
  }, []);

  return {
    execute: executeWithRetry,
    reset,
    ...state
  };
}

// Hook for API calls with automatic retry
export function useApiWithRetry<T extends any[], R>(
  apiCall: (...args: T) => Promise<R>,
  options: RetryOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<R | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const retry = useRetry(apiCall, {
    ...options,
    onRetry: (attempt, error) => {
      console.log(`Retrying API call (attempt ${attempt}):`, error.message);
      options.onRetry?.(attempt, error);
    }
  });

  const execute = useCallback(async (...args: T) => {
    setLoading(true);
    setError(null);

    try {
      const result = await retry.execute(...args);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('API call failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [retry]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    retry.reset();
  }, [retry]);

  return {
    execute,
    reset,
    loading,
    data,
    error,
    isRetrying: retry.isRetrying,
    attempt: retry.attempt
  };
}

export default useRetry;