// 'use client';

// import { useState } from 'react';
// import { useAuthStore } from '@/store/authStore';
// import { Building2 } from 'lucide-react';

// export default function LoginPage() {
//   const { login } = useAuthStore();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     try {
//       await login(email, password);
//       window.location.href = '/';
//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Invalid credentials');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-beige-cream p-4">
//       <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
//         <div className="p-8 space-y-4 text-center border-b border-gray-100">
//           <div className="flex justify-center mb-4">
//             <div className="bg-eastern-red rounded-full p-4">
//               <Building2 className="h-10 w-10 text-white" />
//             </div>
//           </div>
//           <h1 className="text-3xl font-bold text-charcoal">Eastern Estate</h1>
//           <p className="text-maroon-luxe font-medium">Life Long Bonding</p>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 space-y-6">
//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
//               {error}
//             </div>
//           )}

//           <div className="space-y-2">
//             <label className="text-sm font-medium text-charcoal">Email</label>
//             <input
//               type="email"
//               placeholder="admin@easternestate.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               disabled={isLoading}
//               className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eastern-red focus:border-transparent"
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium text-charcoal">Password</label>
//             <input
//               type="password"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               disabled={isLoading}
//               className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eastern-red focus:border-transparent"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-eastern-red text-white py-3 rounded-lg font-medium hover:bg-maroon-luxe transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
//           >
//             {isLoading ? 'Signing in...' : 'Sign In'}
//           </button>

//           <p className="text-sm text-center text-gray-500 pt-4">
//             © 2025 Eastern Estate. All rights reserved.
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import { Building2, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuthStore();

  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: `${5 + Math.random() * 10}s`,
        delay: `${Math.random() * 5}s`,
      }))
    );
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(#F2C94C 1px, transparent 1px), linear-gradient(90deg, #F2C94C 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            animation: "gridMove 20s linear infinite",
          }}
        ></div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#F2C94C] rounded-full"
            style={{
              left: p.left,
              top: p.top,
              animation: `float ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          50% {
            transform: translateY(-100px) translateX(20px);
            opacity: 1;
          }
        }
        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(230, 194, 156, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(230, 194, 156, 0.6);
          }
        }
      `}</style>

      {!showLogin ? (
        <div
          className="text-center space-y-10 z-10 transition-all duration-700"
          style={{
            animation: showLogin
              ? "fadeOut 0.5s ease-out"
              : "fadeIn 0.8s ease-out",
          }}
        >
          <div className="flex justify-center">
            <div
              className="w-24 h-24 rounded-full bg-gradient-to-br bg-[#F3E3C1] flex items-center justify-center text-black text-3xl font-bold shadow-2xl relative"
              style={{ animation: "glow 3s ease-in-out infinite" }}
            >
              <img src="/icon-192.png" alt="eecd_icon" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-7xl font-bold tracking-wider text-[#F3E3C1] bg-clip-text">
              Eastern Estate
            </h1>
            <div className="flex items-center justify-center gap-2 text-[#F2C94C]">
              <Sparkles className="w-4 h-4" />
              <p className="text-sm tracking-widest uppercase">Trusted for decade</p>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
            Where architectural brilliance meets timeless elegance.
            <br />
            <span className="text-[#F2C94C]">
              Crafting dreams into reality.
            </span>
          </p>

          <div className="flex justify-center gap-12 text-center">
            <div>
              <div className="text-3xl font-bold text-[#F3E3C1]">500+</div>
              <div className="text-xs text-gray-500 uppercase">Projects</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#F3E3C1]">25+</div>
              <div className="text-xs text-gray-500 uppercase">Years</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#F3E3C1]">10+</div>
              <div className="text-xs text-gray-500 uppercase">Awards</div>
            </div>
          </div>

          <button
            onClick={() => setShowLogin(true)}
            className="group px-12 py-5 rounded-full bg-gradient-to-r from-[#F2C94C] to-[#d1a16f] text-black font-bold tracking-widest hover:scale-110 transition-all duration-300 shadow-2xl relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Continue
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#d1a16f] to-[#F2C94C] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      ) : (
        <div
          className="w-full max-w-6xl bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#000] rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden z-10 border border-[#222]"
          style={{
            animation: "slideUp 0.8s ease-out",
            boxShadow: "0 20px 80px rgba(230, 194, 156, 0.2)",
          }}
        >
          <div className="p-12 hidden md:flex flex-col justify-center space-y-8 bg-gradient-to-br from-[#141414] to-[#0a0a0a] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2C94C] opacity-5 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              {/* <Building2 className="w-16 h-16 text-[#F2C94C] mb-4" /> */}
              <img src="/icon-192.png" alt="eecd_icon"  className="w-[100px] h-[100px] bg-[#F3E3C1] mb-4 rounded-full" />
              <h2 className="text-5xl font-bold text-[#F3E3C1] mb-4">
                Our Legacy
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Eastern Estate isn't just about construction — it's about
                crafting timeless masterpieces built on trust and excellence.
              </p>
            </div>

            <div className="space-y-4 relative z-10">
              {[
                "Premium Architectural Excellence",
                "Sustainable Building Practices",
                "Three Generations of Trust",
                "Future-Ready Innovations",
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-gray-300 hover:text-[#F2C94C] transition-colors group"
                >
                  <div className="w-2 h-2 bg-[#F2C94C] rotate-45 group-hover:scale-150 transition-transform"></div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-800 pt-6 relative z-10">
              <p className="text-gray-600 text-sm italic">
                "Building the future, one foundation at a time."
              </p>
            </div>
          </div>

          <div className="p-12 flex flex-col justify-center relative">
            <div className="absolute top-6 right-6">
              <div className="w-12 h-12 rounded-full bg-[#F2C94C]/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#F2C94C]" />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-4xl font-bold mb-2 bg-gradient-to-r bg-[#F3E3C1] bg-clip-text text-transparent">
                Welcome Back
              </h3>
              <p className="text-gray-500">
                Enter your credentials to access the dashboard
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-0 top-3 w-5 h-5 text-gray-600 group-focus-within:text-[#F2C94C] transition-colors" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                    className="w-full bg-transparent border-b-2 border-gray-700 py-3 pl-8 outline-none focus:border-[#F2C94C] transition-colors text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-0 top-3 w-5 h-5 text-gray-600 group-focus-within:text-[#F2C94C] transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                    className="w-full bg-transparent border-b-2 border-gray-700 py-3 pl-8 outline-none focus:border-[#F2C94C] transition-colors text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-700"
                  />
                  Remember me
                </label>
                <button className="text-[#F2C94C] hover:underline">
                  Forgot password?
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="group w-full mt-8 py-4 rounded-full bg-gradient-to-r from-[#F2C94C] to-[#d1a16f] text-black font-bold tracking-widest hover:scale-105 transition-all duration-300 shadow-xl relative overflow-hidden disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? "SIGNING IN..." : "ACCESS DASHBOARD"}
                  {!loading && (
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  )}
                </span>
              </button>
            </div>

            <button
              onClick={() => setShowLogin(false)}
              className="mt-8 text-sm text-gray-500 hover:text-[#F2C94C] transition-colors flex items-center gap-2 mx-auto"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Return Home
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
