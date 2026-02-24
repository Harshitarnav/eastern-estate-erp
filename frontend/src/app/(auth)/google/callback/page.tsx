"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Building2, CheckCircle2, XCircle } from "lucide-react";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");

    if (!token || !refreshToken) {
      setStatus("error");
      setMessage("No authentication tokens received");
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    try {
      // Store tokens in localStorage
      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refreshToken);

      // Fetch user profile with the new token
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((userData) => {
          setUser(userData);
          setStatus("success");
          setMessage("Successfully authenticated!");
          setTimeout(() => router.push("/"), 1500);
        })
        .catch((error) => {
          console.error("Failed to fetch user data:", error);
          setStatus("error");
          setMessage("Failed to retrieve user information");
          setTimeout(() => router.push("/login"), 3000);
        });
    } catch (error) {
      console.error("Authentication error:", error);
      setStatus("error");
      setMessage("Authentication failed");
      setTimeout(() => router.push("/login"), 3000);
    }
  }, [searchParams, setUser, router]);

  return (
    <div className="min-h-screen bg-[#F3E3C1] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6">
        {/* Brand Header */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#A8211B] to-[#7B1E12] rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">
            Eastern Estate ERP
          </h1>
          <p className="text-sm text-gray-600">Google Authentication</p>
        </div>

        {status === "loading" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-[#A8211B] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">
              Completing authentication...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-[#3DA35D]" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#3DA35D] mb-1">
                Success!
              </p>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-2">
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-center">
              <XCircle className="w-16 h-16 text-[#A8211B]" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#A8211B] mb-1">
                Authentication Failed
              </p>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-2">
                Redirecting to login...
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F3E3C1] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#A8211B] to-[#7B1E12] rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">
              Eastern Estate ERP
            </h1>
            <p className="text-sm text-gray-600">Google Authentication</p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-[#A8211B] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">
              Loading...
            </p>
          </div>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
