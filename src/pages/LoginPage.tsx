import { useState, useEffect } from 'react'
import { Phone, Lock, ChevronRight, ArrowLeft } from 'lucide-react'

interface LoginPageProps {
  onLoginSuccess: () => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [timer, setTimer] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let interval: any
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [step, timer])

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit phone number.')
      return
    }
    setError('')
    setLoading(true)
    
    // Mock API call
    setTimeout(() => {
      setLoading(false)
      setStep('otp')
      setTimer(30)
    }, 1000)
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length < 4) {
      setError('Please enter the 4-digit OTP.')
      return
    }
    setError('')
    setLoading(true)
    
    // Mock Verification
    setTimeout(() => {
      setLoading(false)
      onLoginSuccess()
    }, 1000)
  }

  const handleResendOtp = () => {
    if (timer === 0) {
      setTimer(30)
      setError('')
      // Mock resend trigger
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      {/* Container with mobile mockup constraints */}
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col justify-between min-h-[550px] relative overflow-hidden animate-slide-in">
        
        {/* Skip sign-in button in top right corner */}
        <button 
          onClick={onLoginSuccess}
          className="absolute top-5 right-5 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-full border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-100"
        >
          Skip Sign In
        </button>

        {/* Top Content */}
        <div className="flex-1 flex flex-col justify-center my-auto">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm p-1.5 mb-4 hover:scale-105 transition-transform">
              <img src="/logo.png" alt="IndiGrocer Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-center">
              Welcome to IndiGrocer
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1.5 text-center px-4">
              Enter your mobile number to sign in or register to manage your MDM billing
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 border border-rose-100 rounded-xl p-3 text-xs font-semibold mb-4 text-center">
              {error}
            </div>
          )}

          {/* Form Step 1: Enter Phone Number */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter 10 digit number"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10.5 pr-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 font-medium text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-sm shadow-indigo-100 hover:shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Get OTP'}
                {!loading && <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
              </button>
            </form>
          )}

          {/* Form Step 2: Enter OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setError(''); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 mb-4 transition-colors"
                >
                  <ArrowLeft size={14} />
                  Change phone number
                </button>
                
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  One-Time Password (OTP)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter 4-digit OTP"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10.5 pr-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 font-medium text-sm tracking-[0.2em] placeholder:tracking-normal focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-400 font-medium">Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={timer > 0}
                  className={`font-bold transition-colors ${
                    timer > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-indigo-650 hover:text-indigo-700'
                  }`}
                >
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-sm shadow-indigo-100 hover:shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
                {!loading && <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
              </button>
            </form>
          )}
        </div>

        {/* Footer section inside card */}
        <div className="pt-6 border-t border-slate-100 mt-6 text-center">
          <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
            Secured by IndiGrocer MDM Network
          </p>
        </div>
      </div>
    </div>
  )
}
