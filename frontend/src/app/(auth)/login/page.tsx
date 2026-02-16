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




// "use client";

// import { useEffect, useState } from "react";
// import { Building2, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
// import { useAuthStore } from "@/store/authStore";

// export default function LoginPage() {
//   const [showLogin, setShowLogin] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const { login } = useAuthStore();

//   const [particles, setParticles] = useState<any[]>([]);

//   useEffect(() => {
//     setParticles(
//       Array.from({ length: 20 }).map(() => ({
//         left: `${Math.random() * 100}%`,
//         top: `${Math.random() * 100}%`,
//         duration: `${5 + Math.random() * 10}s`,
//         delay: `${Math.random() * 5}s`,
//       }))
//     );
//   }, []);

//   const handleSubmit = async () => {
//     if (!email || !password) {
//       setError("Please fill in all fields");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       await login(email, password);
//       window.location.href = "/";
//     } catch (err: any) {
//       setError(err?.response?.data?.message || "Invalid credentials");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black text-white flex items-center justify-center overflow-hidden relative">
//       <div className="absolute inset-0 opacity-20">
//         <div
//           className="absolute inset-0"
//           style={{
//             backgroundImage:
//               "linear-gradient(#F2C94C 1px, transparent 1px), linear-gradient(90deg, #F2C94C 1px, transparent 1px)",
//             backgroundSize: "50px 50px",
//             animation: "gridMove 20s linear infinite",
//           }}
//         ></div>
//       </div>

//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         {particles.map((p, i) => (
//           <div
//             key={i}
//             className="absolute w-1 h-1 bg-[#F2C94C] rounded-full"
//             style={{
//               left: p.left,
//               top: p.top,
//               animation: `float ${p.duration} ease-in-out infinite`,
//               animationDelay: p.delay,
//             }}
//           />
//         ))}
//       </div>

//       <style jsx>{`
//         @keyframes gridMove {
//           0% {
//             transform: translate(0, 0);
//           }
//           100% {
//             transform: translate(50px, 50px);
//           }
//         }
//         @keyframes float {
//           0%,
//           100% {
//             transform: translateY(0px) translateX(0px);
//             opacity: 0;
//           }
//           50% {
//             transform: translateY(-100px) translateX(20px);
//             opacity: 1;
//           }
//         }
//         @keyframes glow {
//           0%,
//           100% {
//             box-shadow: 0 0 20px rgba(230, 194, 156, 0.3);
//           }
//           50% {
//             box-shadow: 0 0 40px rgba(230, 194, 156, 0.6);
//           }
//         }
//       `}</style>

//       {!showLogin ? (
//         <div
//           className="text-center space-y-10 z-10 transition-all duration-700"
//           style={{
//             animation: showLogin
//               ? "fadeOut 0.5s ease-out"
//               : "fadeIn 0.8s ease-out",
//           }}
//         >
//           <div className="flex justify-center">
//             <div
//               className="w-24 h-24 rounded-full bg-gradient-to-br bg-[#F3E3C1] flex items-center justify-center text-black text-3xl font-bold shadow-2xl relative"
//               style={{ animation: "glow 3s ease-in-out infinite" }}
//             >
//               <img src="/icon-192.png" alt="eecd_icon" />
//             </div>
//           </div>

//           <div className="space-y-4">
//             <h1 className="text-7xl font-bold tracking-wider text-[#F3E3C1] bg-clip-text">
//               Eastern Estate
//             </h1>
//             <div className="flex items-center justify-center gap-2 text-[#F2C94C]">
//               <Sparkles className="w-4 h-4" />
//               <p className="text-sm tracking-widest uppercase">Trusted for decade</p>
//               <Sparkles className="w-4 h-4" />
//             </div>
//           </div>

//           <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
//             Where architectural brilliance meets timeless elegance.
//             <br />
//             <span className="text-[#F2C94C]">
//               Crafting dreams into reality.
//             </span>
//           </p>

//           <div className="flex justify-center gap-12 text-center">
//             <div>
//               <div className="text-3xl font-bold text-[#F3E3C1]">500+</div>
//               <div className="text-xs text-gray-500 uppercase">Projects</div>
//             </div>
//             <div>
//               <div className="text-3xl font-bold text-[#F3E3C1]">25+</div>
//               <div className="text-xs text-gray-500 uppercase">Years</div>
//             </div>
//             <div>
//               <div className="text-3xl font-bold text-[#F3E3C1]">10+</div>
//               <div className="text-xs text-gray-500 uppercase">Awards</div>
//             </div>
//           </div>

//           <button
//             onClick={() => setShowLogin(true)}
//             className="group px-12 py-5 rounded-full bg-gradient-to-r from-[#F2C94C] to-[#d1a16f] text-black font-bold tracking-widest hover:scale-110 transition-all duration-300 shadow-2xl relative overflow-hidden"
//           >
//             <span className="relative z-10 flex items-center gap-2">
//               Continue
//               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//             </span>
//             <div className="absolute inset-0 bg-gradient-to-r from-[#d1a16f] to-[#F2C94C] opacity-0 group-hover:opacity-100 transition-opacity"></div>
//           </button>
//         </div>
//       ) : (
//         <div
//           className="w-full max-w-6xl bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#000] rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden z-10 border border-[#222]"
//           style={{
//             animation: "slideUp 0.8s ease-out",
//             boxShadow: "0 20px 80px rgba(230, 194, 156, 0.2)",
//           }}
//         >
//           <div className="p-12 hidden md:flex flex-col justify-center space-y-8 bg-gradient-to-br from-[#141414] to-[#0a0a0a] relative overflow-hidden">
//             <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2C94C] opacity-5 rounded-full blur-3xl"></div>

//             <div className="relative z-10">
//               {/* <Building2 className="w-16 h-16 text-[#F2C94C] mb-4" /> */}
//               <img src="/icon-192.png" alt="eecd_icon"  className="w-[100px] h-[100px] bg-[#F3E3C1] mb-4 rounded-full" />
//               <h2 className="text-5xl font-bold text-[#F3E3C1] mb-4">
//                 Our Legacy
//               </h2>
//               <p className="text-gray-400 text-lg leading-relaxed">
//                 Eastern Estate isn't just about construction — it's about
//                 crafting timeless masterpieces built on trust and excellence.
//               </p>
//             </div>

//             <div className="space-y-4 relative z-10">
//               {[
//                 "Premium Architectural Excellence",
//                 "Sustainable Building Practices",
//                 "Three Generations of Trust",
//                 "Future-Ready Innovations",
//               ].map((item, idx) => (
//                 <div
//                   key={idx}
//                   className="flex items-center gap-3 text-gray-300 hover:text-[#F2C94C] transition-colors group"
//                 >
//                   <div className="w-2 h-2 bg-[#F2C94C] rotate-45 group-hover:scale-150 transition-transform"></div>
//                   <span>{item}</span>
//                 </div>
//               ))}
//             </div>

//             <div className="border-t border-gray-800 pt-6 relative z-10">
//               <p className="text-gray-600 text-sm italic">
//                 "Building the future, one foundation at a time."
//               </p>
//             </div>
//           </div>

//           <div className="p-12 flex flex-col justify-center relative">
//             <div className="absolute top-6 right-6">
//               <div className="w-12 h-12 rounded-full bg-[#F2C94C]/10 flex items-center justify-center">
//                 <Building2 className="w-6 h-6 text-[#F2C94C]" />
//               </div>
//             </div>

//             <div className="mb-8">
//               <h3 className="text-4xl font-bold mb-2 bg-gradient-to-r bg-[#F3E3C1] bg-clip-text text-transparent">
//                 Welcome Back
//               </h3>
//               <p className="text-gray-500">
//                 Enter your credentials to access the dashboard
//               </p>
//             </div>

//             {error && (
//               <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
//                 {error}
//               </div>
//             )}

//             <div className="space-y-6">
//               <div className="space-y-2">
//                 <label className="text-sm text-gray-400 uppercase tracking-wider">
//                   Email Address
//                 </label>
//                 <div className="relative group">
//                   <Mail className="absolute left-0 top-3 w-5 h-5 text-gray-600 group-focus-within:text-[#F2C94C] transition-colors" />
//                   <input
//                     type="email"
//                     placeholder="you@example.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
//                     className="w-full bg-transparent border-b-2 border-gray-700 py-3 pl-8 outline-none focus:border-[#F2C94C] transition-colors text-white"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm text-gray-400 uppercase tracking-wider">
//                   Password
//                 </label>
//                 <div className="relative group">
//                   <Lock className="absolute left-0 top-3 w-5 h-5 text-gray-600 group-focus-within:text-[#F2C94C] transition-colors" />
//                   <input
//                     type="password"
//                     placeholder="••••••••"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
//                     className="w-full bg-transparent border-b-2 border-gray-700 py-3 pl-8 outline-none focus:border-[#F2C94C] transition-colors text-white"
//                   />
//                 </div>
//               </div>

//               <div className="flex items-center justify-between text-sm">
//                 <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     className="w-4 h-4 rounded border-gray-700"
//                   />
//                   Remember me
//                 </label>
//                 <button className="text-[#F2C94C] hover:underline">
//                   Forgot password?
//                 </button>
//               </div>

//               <button
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 className="group w-full mt-8 py-4 rounded-full bg-gradient-to-r from-[#F2C94C] to-[#d1a16f] text-black font-bold tracking-widest hover:scale-105 transition-all duration-300 shadow-xl relative overflow-hidden disabled:opacity-50"
//               >
//                 <span className="relative z-10 flex items-center justify-center gap-2">
//                   {loading ? "SIGNING IN..." : "ACCESS DASHBOARD"}
//                   {!loading && (
//                     <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                   )}
//                 </span>
//               </button>
//             </div>

//             <button
//               onClick={() => setShowLogin(false)}
//               className="mt-8 text-sm text-gray-500 hover:text-[#F2C94C] transition-colors flex items-center gap-2 mx-auto"
//             >
//               <ArrowRight className="w-4 h-4 rotate-180" />
//               Return Home
//             </button>
//           </div>
//         </div>
//       )}

//       <style jsx>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         @keyframes fadeOut {
//           from {
//             opacity: 1;
//           }
//           to {
//             opacity: 0;
//           }
//         }
//         @keyframes slideUp {
//           from {
//             opacity: 0;
//             transform: translateY(50px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//       `}</style>
//     </div>
//   );
// }








"use client";

/**
 * =========================================================
 * Eastern Estate ERP – Login Page
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * - Secure authentication entry point for ERP users
 * - Allows Admins, Investors & Staff to log in
 * - Integrated with global Zustand Auth Store
 *
 * FEATURES
 * ---------------------------------------------------------
 * ✔ Proper <form onSubmit> handling
 * ✔ Enter key support (native + accessible)
 * ✔ Loading & disabled states
 * ✔ Error handling with UX improvements
 * ✔ Password visibility toggle
 * ✔ Next.js App Router navigation
 * ✔ Tailwind CSS + Lucide Icons
 *
 * =========================================================
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  /**
   * -------------------------------------------------------
   * LOCAL COMPONENT STATE
   * -------------------------------------------------------
   */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * -------------------------------------------------------
   * GLOBAL AUTH STORE (ZUSTAND)
   * -------------------------------------------------------
   * login(email, password):
   * - Calls backend authentication API
   * - Stores JWT token
   * - Stores logged-in user data
   */
  const { login } = useAuthStore();
  const router = useRouter();

  /**
   * -------------------------------------------------------
   * HANDLE LOGIN SUBMISSION
   * -------------------------------------------------------
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      setError("Please enter your registered email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Call global auth login
      await login(email, password);

      // Redirect to ERP Dashboard
      console.log("Login successful, redirecting...");
      router.push("/");
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err?.response?.data?.message || err?.userMessage || err?.message || "Invalid login credentials";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ====================================================
          PAGE WRAPPER
      ==================================================== */}
      <div className="min-h-screen bg-[#F3E3C1] relative overflow-hidden">

        {/* Decorative Background Accents */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-[#A8211B] to-transparent opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-[#3DA35D] to-transparent opacity-10 rounded-full translate-x-1/3 translate-y-1/3" />

        {/* Brand Gradient Strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#A8211B] via-[#F2C94C] to-[#3DA35D]" />

        {/* ====================================================
            MAIN CONTAINER
        ==================================================== */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 animate-fadeIn">
          <div className="w-full max-w-6xl min-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2">

            {/* ==================================================
                LEFT PANEL – BRAND / INFO
            ================================================== */}
            <div className="hidden lg:flex relative bg-gradient-to-br from-[#7B1E12] via-[#A8211B] to-[#7B1E12] p-12 flex-col justify-between">

              {/* Glow Effects */}
              <div className="absolute top-10 right-10 w-40 h-40 bg-[#F2C94C]/20 rounded-full blur-3xl" />
              <div className="absolute bottom-10 left-10 w-60 h-60 bg-[#3DA35D]/20 rounded-full blur-3xl" />

              <div className="relative z-10">

                {/* Brand Header */}
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-12 h-12 bg-white/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <img src="/icon-192.png" className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white">
                      EASTERN ESTATE ERP
                    </div>
                    <div className="text-xs text-[#F2C94C] font-semibold">
                      Trusted for Decades
                    </div>
                  </div>
                </div>

                {/* Welcome Text */}
                <h2 className="text-5xl font-black text-white mb-4">
                  Welcome Back
                </h2>
                <p className="text-lg text-white/80 mb-8">
                  Securely manage your real estate operations & investments
                </p>

                {/* Feature List */}
                <div className="space-y-4">
                  {[
                    "Live project & booking updates",
                    "Secure client & document management",
                    "Investment & payment tracking",
                    "24/7 administrative support",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[#F2C94C] rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-[#7B1E12]" />
                      </div>
                      <span className="text-white/90 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* ==================================================
                RIGHT PANEL – LOGIN FORM
            ================================================== */}
            <div className="p-6 sm:p-10 flex items-center justify-center bg-[#F3E3C1]/30">
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-md space-y-6"
              >

                {/* Mobile Brand */}
                <div className="flex lg:hidden items-center justify-center gap-2">
                  <img src="/icon-192.png" className="w-7 h-7" />
                  <span className="font-black text-lg">
                    EASTERN ESTATE ERP
                  </span>
                </div>

                {/* Heading */}
                <div className="text-center">
                  <h3 className="text-3xl font-black text-[#333]">
                    ERP Login
                  </h3>
                  <p className="text-sm text-[#333]/60">
                    Access your Eastern Estate dashboard
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-[#A8211B]/10 border-l-4 border-[#A8211B] rounded-lg animate-slideDown">
                    <p className="text-sm font-semibold text-[#A8211B]">
                      {error}
                    </p>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="text-xs font-bold mb-1 block">
                    REGISTERED EMAIL
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      disabled={loading}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="user@easternestate.com"
                      className={`w-full pl-12 py-4 border-2 rounded-xl outline-none transition
                        focus:border-[#A8211B] focus:ring-2 focus:ring-[#A8211B]/20
                        ${error ? "border-[#A8211B]" : "border-gray-300"}`}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="text-xs font-bold mb-1 block">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      disabled={loading}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl outline-none transition
                        focus:border-[#A8211B] focus:ring-2 focus:ring-[#A8211B]/20
                        ${error ? "border-[#A8211B]" : "border-gray-300"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                      w-full py-5 bg-gradient-to-r from-[#A8211B] to-[#7B1E12]
                      text-white font-black rounded-xl flex items-center justify-center gap-3
                      shadow-lg shadow-[#A8211B]/30
                      hover:scale-[1.03] active:scale-[0.97]
                      transition-all duration-200
                      disabled:opacity-50 disabled:hover:scale-100
                    `}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      ACCESS ERP <ArrowRight />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#F3E3C1]/30 text-gray-600 font-bold">
                      OR
                    </span>
                  </div>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={() => {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
                    window.location.href = `${apiUrl}/auth/google`;
                  }}
                  className="w-full py-5 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:border-gray-400 transition-all duration-200"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google (@eecd.in)
                </button>

                {/* Info Text */}
                <div className="space-y-2">
                  <p className="text-xs text-center text-gray-500">
                    <span className="font-bold text-[#4285F4]">💡 Multiple Google Accounts?</span>
                    <br />
                    You'll be able to choose which account to use on the next screen.
                  </p>
                  <p className="text-xs text-center text-gray-500">
                    Only <span className="font-bold text-[#A8211B]">@eecd.in</span> email addresses are allowed.
                    <br />
                    Contact <span className="font-semibold">hr@eecd.in</span> if you don't have access.
                  </p>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          GLOBAL PAGE ANIMATIONS
      ==================================================== */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

