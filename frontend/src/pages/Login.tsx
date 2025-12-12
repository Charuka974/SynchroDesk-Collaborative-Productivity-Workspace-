import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { forgotPassword, getMyDetails, login } from "../services/auth"
import { useAuth } from "../context/authContext"
import Swal from "sweetalert2"

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading] = useState(false)
  const { setUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");


  const Toast = Swal.mixin({
    toast: true,
    position: "top-end", //top-right
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
  

  const handleLogin = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault() // prevent page refresh

    if (!email.trim() || !password.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Please enter both email and password."
      });
      return
    }

    try {
      const data: any = await login(email, password)

      if (data?.data?.accessToken) {
        await localStorage.setItem("accessToken", data.data.accessToken)
        await localStorage.setItem("refreshToken", data.data.refreshToken)

        const resData = await getMyDetails()

        setUser(resData.data)

        Toast.fire({
            icon: "success",
            title: `Welcome back, ${resData.data.name}!`
        });

        navigate("/home")
      } else {
        Toast.fire({
            icon: "error",
            title: "Login failed, please check your credentials."
        });
      }
    } catch (err) {
      console.error("Login error:", err)
      Toast.fire({
        icon: "error",
        title: "Login failed, please check your credentials."
      });
    }

  }


  // Function to handle forgot password
  const handleSendResetLink = async () => {
    
    if (!forgotEmail.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Please enter your email",
      });
      return;
    }

    try {
      const response: any = await forgotPassword(forgotEmail);

      Swal.fire({
        icon: "success",
        title: response.data?.message || `Reset link sent to ${forgotEmail}`,
      });

      setShowForgotPasswordModal(false);
      setForgotEmail("");
    } catch (err: any) {
      console.error("Forgot password error:", err);
      Swal.fire({
        icon: "error",
        title: err.response?.data?.message || "Something went wrong",
      });
    }
  };


  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-gray-900 to-gray-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">SynchroDesk</h1>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Organize.<br />
            Collaborate.<br />
            Achieve Together.
          </h2>
          
          <p className="text-gray-100 text-lg">
            Your team's productivity workspace where tasks sync seamlessly and collaboration flows naturally.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Real-time Collaboration</h3>
              <p className="text-gray-100 text-sm">Work together with your team in real-time, no matter where you are.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Smart Task Management</h3>
              <p className="text-gray-100 text-sm">Organize tasks with intelligent prioritization and tracking.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Lightning Fast</h3>
              <p className="text-gray-100 text-sm">Instant sync across all devices keeps your team moving forward.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-gray-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SynchroDesk</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Welcome back</h2>
              <p className="text-gray-600 font-bold">Sign in to your workspace</p>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="username"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  disabled={isLoading}
                />
              </div>

              {/* <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  disabled={isLoading}
                />
              </div> */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      // Eye slash icon (hide password)
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      // Eye icon (show password)
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                  Remember me for 30 days
                </label>
              </div> */}

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-slate-500/50 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none relative overflow-hidden group"
              >
                {/* Animated shimmer effect */}
                <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
                
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <>
                    <span className="relative z-10">Sign in</span>
                    <svg className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button 
                  onClick={() => navigate("/register")} 
                  className="text-gray-900 font-semibold hover:text-gray-700 transition">
                  Create one free
                </button>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                By signing in, you agree to our{" "}
                <button className="text-gray-600 hover:underline">Terms of Service</button>
                {" "}and{" "}
                <button className="text-gray-600 hover:underline">Privacy Policy</button>
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Need help? <button className="text-gray-600 hover:underline">Contact support</button>
          </p>
        </div>
      </div>

      {showForgotPasswordModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
          onClick={() => setShowForgotPasswordModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 mt-8 mb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-4">
              Forgot Password
            </h2>
            <p className="text-gray-600 mb-4">
              Enter your email address and we'll send you a reset link.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendResetLink}
                className="flex-1 px-4 py-2 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl border-b border-slate-600 font-bold text-white rounded-lg hover:bg-gray-700 transition"
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}