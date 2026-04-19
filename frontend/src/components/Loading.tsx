import { HinglishLoader, LoaderContext } from './HinglishLoader';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  context?: LoaderContext;
  compact?: boolean;
}

/**
 * Legacy `Loading` wrapper kept for back-compat. All existing callers now
 * automatically get the richer HinglishLoader experience.
 */
export function Loading({
  message,
  fullScreen = false,
  context = 'default',
  compact = false,
}: LoadingProps) {
  return (
    <HinglishLoader
      fullScreen={fullScreen}
      context={context}
      compact={compact}
      label={message && message !== 'Loading…' && message !== 'Loading...' ? message : undefined}
    />
  );
}

export default Loading;
