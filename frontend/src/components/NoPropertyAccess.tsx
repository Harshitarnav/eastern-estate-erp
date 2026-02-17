'use client';

import { useRouter } from 'next/navigation';
import { 
  ShieldX, 
  Mail, 
  Phone, 
  Building2,
  ArrowLeft,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

interface NoPropertyAccessProps {
  message?: string;
  showContactInfo?: boolean;
  canGoBack?: boolean;
}

export default function NoPropertyAccess({ 
  message = "No Property Access Assigned",
  showContactInfo = true,
  canGoBack = true
}: NoPropertyAccessProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const handleContactHR = () => {
    // Open default email client
    window.location.href = 'mailto:hr@eecd.in?subject=Property Access Request&body=Hi HR Team,%0D%0A%0D%0AI need property access to start working. My details:%0D%0AName: ' + encodeURIComponent(`${user?.firstName} ${user?.lastName}`) + '%0D%0AEmail: ' + encodeURIComponent(user?.email || '') + '%0D%0A%0D%0AThank you!';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Icon */}
          <div className="bg-gradient-to-r from-[#A8211B] to-[#7B1E12] p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <ShieldX className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {message}
            </h1>
            <p className="text-white/90 text-lg">
              You need property access to view this content
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-6 border-l-4" style={{ borderColor: '#A8211B' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#A8211B] to-[#7B1E12] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Current Status:</strong> No property access assigned</p>
                <p><strong>Your Role:</strong> {user?.roles?.[0]?.displayName || 'Not assigned'}</p>
              </div>
            </div>

            {/* What's Happening */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[#A8211B]" />
                What's happening?
              </h3>
              <div className="space-y-2 text-gray-700">
                <p>
                  Your account has been created successfully, but you haven't been assigned access to any properties yet.
                </p>
                <p>
                  To start working, an administrator needs to grant you access to one or more properties based on your role.
                </p>
              </div>
            </div>

            {/* What to Do */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">What should I do?</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <p className="text-sm text-blue-900 font-medium">
                  ✉️ Contact your HR department or system administrator to request property access.
                </p>
                <p className="text-sm text-blue-800">
                  They will assign you to the appropriate property based on your role and responsibilities.
                </p>
              </div>
            </div>

            {/* Contact Options */}
            {showContactInfo && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Need help?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email HR */}
                  <button
                    onClick={handleContactHR}
                    className="flex items-center gap-3 p-4 bg-white border-2 rounded-lg hover:border-[#A8211B] hover:bg-gray-50 transition-all group"
                    style={{ borderColor: '#E5E7EB' }}
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-[#A8211B]/10 flex items-center justify-center group-hover:bg-[#A8211B]/20 transition-colors">
                        <Mail className="h-5 w-5" style={{ color: '#A8211B' }} />
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Email HR</p>
                      <p className="text-sm text-gray-600">hr@eecd.in</p>
                    </div>
                  </button>

                  {/* Call Support */}
                  <a
                    href="tel:+919876543210"
                    className="flex items-center gap-3 p-4 bg-white border-2 rounded-lg hover:border-[#A8211B] hover:bg-gray-50 transition-all group"
                    style={{ borderColor: '#E5E7EB' }}
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-[#A8211B]/10 flex items-center justify-center group-hover:bg-[#A8211B]/20 transition-colors">
                        <Phone className="h-5 w-5" style={{ color: '#A8211B' }} />
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Call Support</p>
                      <p className="text-sm text-gray-600">+91 98765 43210</p>
                    </div>
                  </a>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {canGoBack && (
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              )}
              <Button
                onClick={() => router.push('/settings')}
                className="flex-1"
                style={{ 
                  backgroundColor: '#A8211B',
                  color: 'white'
                }}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Go to Settings
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t text-center">
            <p className="text-sm text-gray-600">
              Once property access is granted, refresh this page or log out and log back in.
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need immediate assistance? Contact your manager or IT support team.
          </p>
        </div>
      </div>
    </div>
  );
}
