'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Building2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige-cream p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="p-8 space-y-4 text-center border-b border-gray-100">
          <div className="flex justify-center mb-4">
            <div className="bg-eastern-red rounded-full p-4">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-charcoal">Eastern Estate</h1>
          <p className="text-maroon-luxe font-medium">Life Long Bonding</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-charcoal">Email</label>
            <input
              type="email"
              placeholder="admin@easternestate.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eastern-red focus:border-transparent"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-charcoal">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eastern-red focus:border-transparent"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-eastern-red text-white py-3 rounded-lg font-medium hover:bg-maroon-luxe transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <p className="text-sm text-center text-gray-500 pt-4">
            © 2025 Eastern Estate. All rights reserved.
          </p>
        </form>
      </div>
    </div>
  );
}
