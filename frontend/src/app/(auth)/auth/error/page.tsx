'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const message = searchParams.get('message');
    setErrorMessage(message || 'An unknown authentication error occurred');
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-lg text-gray-600">Authentication Error</p>
        </div>

        <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded-lg">
          <p className="text-sm text-gray-800 font-medium">{errorMessage}</p>
        </div>

        {errorMessage.includes('@eecd.in') && (
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 rounded-lg">
            <p className="text-sm text-gray-800 mb-2">
              <strong>Email Restriction:</strong>
            </p>
            <p className="text-sm text-gray-700">
              Only email addresses ending with <strong>@eecd.in</strong> are allowed to access this system.
            </p>
            <p className="text-sm text-gray-700 mt-2">
              If you need access, please contact your HR department at{' '}
              <a href="mailto:hr@eecd.in" className="text-blue-600 font-medium hover:underline">
                hr@eecd.in
              </a>
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
