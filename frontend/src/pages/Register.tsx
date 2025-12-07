import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { register } from "../services/auth"
import Swal from "sweetalert2"


export default function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end", //top-right
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const handleRegister = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !password.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Please fill in all fields."
      });
      return
    }

    if (password !== confirmPassword) {
      Toast.fire({
        icon: "error",
        title: "Passwords do not match."
      });
      return
    }

    // if (password.length < 8) {
    //   Toast.fire({
    //     icon: "warning",
    //     title: "Password must be at least 8 characters long."
    //   });
    //   return
    // }

    try {
      const data: any = await register(name, email, password)

      Toast.fire({
        icon: "success",
        title: `Registration successful! Email: ${data.data.email}`
      });

      navigate("/login")
    } catch (err: any) {
      console.error("Registration error:", err)
      Toast.fire({
        icon: "error",
        title: "Registration failed. Please try again."
      });
    }
  }

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
              <svg className="w-7 h-7 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">SynchroDesk</h1>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Join thousands of<br />
            productive teams<br />
            worldwide.
          </h2>
          
          <p className="text-gray-100 text-lg">
            Create your free account and start collaborating with your team in minutes.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <p className="text-white text-sm">No credit card required</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <p className="text-white text-sm">Free forever for small teams</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <p className="text-white text-sm">Cancel anytime, no questions asked</p>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SynchroDesk</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
              <p className="text-gray-600">Start your productivity journey today</p>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  disabled={isLoading}
                />
              </div>

              {/* PASSWORD FIELD */}
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

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
                  className="absolute right-3 top-13 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
              </div>


              {/* CONFIRM PASSWORD FIELD */}
              <div className="relative mt-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  disabled={isLoading}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-13 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition p-1"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>


              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500 mt-1"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  I agree to the{" "}
                  <button className="text-gray-900 hover:underline">Terms of Service</button>
                  {" "}and{" "}
                  <button className="text-gray-900 hover:underline">Privacy Policy</button>
                </label>
              </div>

              <button
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  "Creating account..."
                ) : (
                  <>
                    Create account
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button 
                  onClick={() => navigate("/login")} 
                  className="text-gray-900 font-semibold hover:text-gray-700 transition">
                  Sign in
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Need help? <button className="text-gray-900 hover:underline">Contact support</button>
          </p>
        </div>
      </div>
    </div>
  )
}