"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, XCircle, ArrowLeft, Shield } from "lucide-react";

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  const errorMessage =
    searchParams.get("message") ||
    "An error occurred during authentication";

  // Determine error type for better UX
  const isAccessDenied =
    errorMessage.includes("do not have access") ||
    errorMessage.includes("not found");
  const isDomainRestricted = errorMessage.includes("@eecd.in");
  const isDeactivated = errorMessage.includes("deactivated");

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const getErrorTitle = () => {
    if (isAccessDenied) return "Access Not Granted Yet";
    if (isDomainRestricted) return "Domain Restriction";
    if (isDeactivated) return "Account Deactivated";
    return "Authentication Error";
  };

  const getErrorIcon = () => {
    if (isAccessDenied) return <Shield className="w-20 h-20 text-[#F2C94C]" />;
    return <XCircle className="w-20 h-20 text-[#A8211B]" />;
  };

  const getHelpText = () => {
    if (isAccessDenied) {
      return (
        <div className="space-y-3 text-left">
          <p className="font-semibold text-gray-800">
            Your Google account was recognized, but you haven't been added to the system yet.
          </p>
          <div className="bg-[#F2C94C]/10 border-l-4 border-[#F2C94C] p-4 rounded">
            <p className="font-bold text-gray-800 mb-2">What to do:</p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Contact your HR department at <strong>hr@eecd.in</strong></li>
              <li>• Request account creation in the ERP system</li>
              <li>• Provide your @eecd.in email address</li>
              <li>• Wait for HR to assign your roles and permissions</li>
            </ul>
          </div>
        </div>
      );
    }

    if (isDomainRestricted) {
      return (
        <div className="space-y-3 text-left">
          <p className="font-semibold text-gray-800">
            Only <strong>@eecd.in</strong> email addresses can access this system.
          </p>
          <div className="bg-[#A8211B]/10 border-l-4 border-[#A8211B] p-4 rounded">
            <p className="font-bold text-gray-800 mb-2">To gain access:</p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Use your company Google Workspace account</li>
              <li>• Ensure your email ends with @eecd.in</li>
              <li>• Contact IT if you don't have a company email</li>
            </ul>
          </div>
        </div>
      );
    }

    if (isDeactivated) {
      return (
        <div className="space-y-3 text-left">
          <p className="font-semibold text-gray-800">
            Your account has been temporarily deactivated.
          </p>
          <div className="bg-[#A8211B]/10 border-l-4 border-[#A8211B] p-4 rounded">
            <p className="font-bold text-gray-800 mb-2">Next steps:</p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Contact your administrator or HR</li>
              <li>• Email: <strong>hr@eecd.in</strong> or <strong>info@eecd.in</strong></li>
              <li>• Request account reactivation</li>
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center text-gray-600">
        <p>Please try again or contact support if the problem persists.</p>
        <p className="mt-2">
          Email: <strong>hr@eecd.in</strong>
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F3E3C1] flex items-center justify-center px-4">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-[#A8211B] to-transparent opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-[#F2C94C] to-transparent opacity-10 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Red accent strip at top */}
        <div className="h-2 bg-gradient-to-r from-[#A8211B] via-[#F2C94C] to-[#A8211B]" />

        <div className="p-8 sm:p-12 space-y-6">
          {/* Brand Header */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#A8211B] to-[#7B1E12] rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-black text-gray-800 mb-1">
              Eastern Estate ERP
            </h1>
            <p className="text-sm text-gray-500">Authentication Service</p>
          </div>

          {/* Error Icon */}
          <div className="flex justify-center animate-fadeIn">
            {getErrorIcon()}
          </div>

          {/* Error Title */}
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-800 mb-2">
              {getErrorTitle()}
            </h2>
            <p className="text-gray-600 italic">"{errorMessage}"</p>
          </div>

          {/* Help Text */}
          <div className="max-w-lg mx-auto">{getHelpText()}</div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            {/* Primary: Try Different Account */}
            <button
              onClick={() => {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
                window.location.href = `${apiUrl}/auth/google`;
              }}
              className="w-full py-4 bg-gradient-to-r from-[#4285F4] to-[#357ABD] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Try Different Google Account
            </button>

            {/* Secondary Actions */}
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => router.push("/login")}
                className="py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>

              <button
                onClick={() => (window.location.href = "mailto:hr@eecd.in")}
                className="py-3 bg-white border-2 border-[#A8211B] text-[#A8211B] font-bold rounded-xl hover:bg-[#A8211B]/5 transition-colors"
              >
                Contact HR
              </button>
            </div>
          </div>

          {/* Auto-redirect notice */}
          <div className="text-center text-sm text-gray-500">
            Automatically redirecting to login in{" "}
            <span className="font-bold text-[#A8211B]">{countdown}</span>{" "}
            seconds...
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F3E3C1] flex items-center justify-center px-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#A8211B] via-[#F2C94C] to-[#A8211B]" />
          <div className="p-8 sm:p-12 space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#A8211B] to-[#7B1E12] rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-gray-800 mb-1">
                Eastern Estate ERP
              </h1>
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
