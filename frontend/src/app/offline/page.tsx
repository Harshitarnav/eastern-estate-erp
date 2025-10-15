import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <WifiOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">You're Offline</h1>
        <p className="text-gray-600">Check your internet connection and try again.</p>
      </div>
    </div>
  );
}
