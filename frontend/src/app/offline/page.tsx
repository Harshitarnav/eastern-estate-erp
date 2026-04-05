'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-6 text-center">
      {/* Icon */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg"
        style={{ backgroundColor: '#A8211B' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M6.343 17.657a9 9 0 010-12.728M9.172 15.536a5 5 0 010-7.072M12 12h.01"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold mb-2" style={{ color: '#7B1E12' }}>
        You&apos;re Offline
      </h1>
      <p className="text-gray-600 mb-2 max-w-xs">
        Eastern Estate ERP needs an internet connection to load new data.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Please check your Wi-Fi or mobile data and try again.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="px-8 py-3 rounded-2xl text-white font-semibold shadow-lg active:scale-95 transition-transform"
        style={{ backgroundColor: '#A8211B' }}
      >
        Try Again
      </button>

      <p className="mt-8 text-xs text-gray-400">
        Eastern Estate ERP • Life Long Bonding...
      </p>
    </div>
  );
}
