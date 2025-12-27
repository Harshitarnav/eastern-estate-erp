interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({
  message = "Loading…",
  fullScreen = false,
}: LoadingProps) {
  const content = (
    <>
      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fade-in-soft {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-orbit {
          animation: orbit 1.6s linear infinite;
        }

        .animate-fade-soft {
          animation: fade-in-soft 0.3s ease-out;
        }
      `}</style>
      <div className="flex flex-col items-center gap-4 animate-fade-soft">
        <div className="relative h-12 w-12 animate-orbit">
          <span className="absolute top-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-800" />
          <span className="absolute inset-0 rounded-full border border-amber-600/30" />
        </div>

        <p className="text-sm font-medium tracking-wide text-amber-600">
          {message}
        </p>
      </div>
    </>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16">{content}</div>
  );
}