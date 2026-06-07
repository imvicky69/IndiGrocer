import { createContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { 
  User as FirebaseUser,
  ConfirmationResult,
  ApplicationVerifier
} from 'firebase/auth'
import { 
  onAuthStateChanged,
  signInWithPhoneNumber,
  signOut
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import type { Timestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  role: 'super_admin' | 'billing_staff' | 'headmaster';
  isActive: boolean;
  createdAt: Timestamp;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  confirmationResult: ConfirmationResult | null;
  signInWithPhone: (phoneNumber: string, verifier: ApplicationVerifier) => Promise<ConfirmationResult>;
  confirmOtp: (code: string) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true)
      setError(null)
      setUser(currentUser)

      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile)
          } else {
            setProfile(null)
            setError('User profile not found in database. Contact your administrator.')
          }
        } catch (err: any) {
          console.error('Error fetching user profile:', err)
          setError('Failed to load user profile.')
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithPhone = async (phoneNumber: string, verifier: ApplicationVerifier) => {
    setError(null)
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier)
      setConfirmationResult(confirmation)
      return confirmation
    } catch (err: any) {
      console.error('Error sending OTP:', err)
      setError(err.message || 'Failed to send OTP. Please check your number.')
      throw err;
    }
  }

  const confirmOtp = async (code: string) => {
    setError(null)
    if (!confirmationResult) {
      throw new Error('No active confirmation session found.')
    }
    try {
      const credential = await confirmationResult.confirm(code)
      if (credential.user) {
        setUser(credential.user)
        return credential.user
      }
      throw new Error('Authentication failed.')
    } catch (err: any) {
      console.error('Error verifying OTP:', err)
      setError(err.message || 'Invalid verification code.')
      throw err;
    }
  }

  const logout = async () => {
    setError(null)
    try {
      await signOut(auth)
      setUser(null)
      setProfile(null)
      setConfirmationResult(null)
    } catch (err: any) {
      console.error('Error logging out:', err)
      setError('Failed to log out.')
    }
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        confirmationResult,
        signInWithPhone,
        confirmOtp,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
