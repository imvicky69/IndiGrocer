import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export function OtpVerificationPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']) // Firebase OTP is normally 6 digits
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(30)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const { confirmOtp, confirmationResult } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Get phoneNumber passed from LoginPage state
  const state = location.state as {
    phoneNumber: string
  } | null

  const phoneNumber = state?.phoneNumber || ''

  useEffect(() => {
    if (!confirmationResult) {
      setError('Invalid session. Please request OTP again.')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    }
  }, [navigate, confirmationResult])

  // Countdown timer for Resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [resendTimer])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Allow only digits

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Store only the last character entered
    setOtp(newOtp)

    // Automatically focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp]
      
      if (!otp[index] && index > 0) {
        // If current is empty, delete previous and focus it
        newOtp[index - 1] = ''
        setOtp(newOtp)
        const prevInput = document.getElementById(`otp-${index - 1}`)
        if (prevInput) prevInput.focus()
      } else {
        newOtp[index] = ''
        setOtp(newOtp)
      }
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResendSuccess(false)

    const code = otp.join('')
    if (code.length < 6) {
      setError('Please enter all 6 digits.')
      return
    }

    if (!confirmationResult) {
      setError('Session expired. Please request a new OTP.')
      return
    }

    setLoading(true)
    try {
      await confirmOtp(code)
      navigate('/')
    } catch (err: any) {
      console.error('OTP confirmation failed:', err)
      setError(err.message || 'Incorrect verification code. Please try again.')
      setOtp(['', '', '', '', '', ''])
      const firstInput = document.getElementById('otp-0')
      if (firstInput) firstInput.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0 || resending) return
    setError('')
    setResendSuccess(false)
    setResending(true)

    try {
      setError('Please go back and request a new code to complete recaptcha.')
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col justify-between min-h-[500px] relative overflow-hidden animate-slide-in">
        
        {/* Top Navigation */}
        <button
          onClick={() => navigate('/login')}
          className="self-start flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider mb-8"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Core Content */}
        <div className="flex-1 flex flex-col justify-center my-auto">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-center">
              Verify Code
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1.5 text-center px-4">
              We sent a 6-digit OTP code to <span className="text-slate-600 font-bold">{phoneNumber || 'your phone'}</span>
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 border border-rose-100 rounded-xl p-3 text-xs font-semibold mb-4 text-center">
              {error}
            </div>
          )}

          {resendSuccess && (
            <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl p-3 text-xs font-semibold mb-4 text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 size={14} /> New OTP sent successfully!
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-between gap-2.5 max-w-[320px] mx-auto">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={loading}
                  className="w-10 h-12 text-center text-lg font-bold bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-sm shadow-indigo-100 hover:shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>

          <div className="text-center mt-6">
            {resendTimer > 0 ? (
              <p className="text-xs text-slate-400 font-semibold">
                Resend code in <span className="text-indigo-600 font-bold">{resendTimer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider"
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 mt-6 text-center">
          <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
            Secured by IndiGrocer MDM Network
          </p>
        </div>
      </div>
    </div>
  )
}
