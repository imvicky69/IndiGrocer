import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, ChevronRight } from 'lucide-react'
import { RecaptchaVerifier } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAuth } from '../../hooks/useAuth'

export function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)
  
  const { signInWithPhone } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Setup invisible recaptcha verifier
    try {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, proceed with phone auth
        },
        'expired-callback': () => {
          setError('Recaptcha expired. Please try again.')
        }
      })
    } catch (err: any) {
      console.error('Recaptcha initialization failed:', err)
      setError('Failed to initialize recaptcha.')
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear()
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanNumber = phoneNumber.trim()
    if (!cleanNumber) {
      setError('Please enter a phone number.')
      return
    }

    if (cleanNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    const formattedPhone = `+91${cleanNumber}`

    setLoading(true)
    try {
      if (!recaptchaVerifierRef.current) {
        throw new Error('Recaptcha verifier is not ready.')
      }

      await signInWithPhone(formattedPhone, recaptchaVerifierRef.current)
      
      // Navigate to OTP verification page, passing only phone number in router state (no confirmationResult to avoid pushState clone errors)
      navigate('/verify', {
        state: {
          phoneNumber: formattedPhone
        }
      })
    } catch (err: any) {
      console.error('Sign in error:', err)
      // Recaptcha reset on error
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear()
        // Re-create recaptcha
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible'
        })
      }
      setError(err.message || 'Failed to send OTP. Please check your network.')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneChange = (value: string) => {
    // Allow only digits and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10)
    setPhoneNumber(digitsOnly)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      {/* Invisible container for Recaptcha */}
      <div id="recaptcha-container"></div>

      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col justify-between min-h-[500px] relative overflow-hidden animate-slide-in">
        
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
              Enter your mobile number to sign in and manage your MDM billing
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 border border-rose-100 rounded-xl p-3 text-xs font-semibold mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone size={16} />
                </div>
                {/* Visual Prefix */}
                <div className="absolute inset-y-0 left-9 flex items-center pointer-events-none text-slate-500 font-bold text-sm select-none">
                  +91
                </div>
                <input
                  type="tel"
                  placeholder="Enter 10 digit number"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full pl-18 pr-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 font-medium text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
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
