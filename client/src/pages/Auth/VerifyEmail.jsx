import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import api from '../../config/api'
import toast from 'react-hot-toast'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000)
      return () => clearTimeout(interval)
    }
  }, [timer])

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/auth/verify-email', { email, code })
      setVerified(true)
      toast.success('Email verified successfully!')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setLoading(true)
    try {
      await api.post('/auth/resend-verification-code', { email })
      setTimer(60)
      toast.success('Verification code resent!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-red-500" />
          </div>
          <h2 className="text-3xl font-bold">Verify Your Email</h2>
          <p className="text-gray-600 mt-2">Enter the code sent to {email}</p>
        </div>

        {!verified ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ENTER 6-DIGIT CODE"
                maxLength="6"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 text-center text-2xl tracking-widest font-bold"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Check your email for a 6-digit verification code
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full btn-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-check text-2xl text-green-600"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">Email Verified!</h3>
            <p className="text-gray-600">Your email has been verified successfully. Redirecting to login...</p>
          </div>
        )}

        {!verified && (
          <div className="mt-6 text-center border-t pt-6">
            <p className="text-sm text-gray-600 mb-4">Didn't receive the code?</p>
            <button
              onClick={handleResendCode}
              disabled={timer > 0 || loading}
              className="text-red-500 font-semibold hover:text-red-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
            </button>
          </div>
        )}

        {!verified && (
          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-red-500 font-semibold hover:text-red-600">
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
