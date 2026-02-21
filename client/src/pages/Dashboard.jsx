import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Bookmark, MapPin, Calendar } from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../config/api'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings/user/my-bookings')
        setBookings(data.data || [])
      } catch (error) {
        toast.error('Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user, navigate])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-max py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}!</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 border border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="text-gray-600 text-sm font-semibold mb-2">Total Bookings</div>
            <div className="text-4xl font-bold">{bookings.length}</div>
          </div>
          <div className="card p-6">
            <div className="text-gray-600 text-sm font-semibold mb-2">Active Bookings</div>
            <div className="text-4xl font-bold">
              {bookings.filter((b) => b.status === 'confirmed').length}
            </div>
          </div>
          <div className="card p-6">
            <div className="text-gray-600 text-sm font-semibold mb-2">Total Spent</div>
            <div className="text-4xl font-bold">
              ${bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)}
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Bookmark size={28} />
            My Bookings
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin mx-auto"></div>
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    <div>
                      <p className="text-gray-600 text-sm font-semibold mb-1">Booking ID</p>
                      <p className="font-mono text-sm">{booking.bookingNumber || booking._id?.slice(0, 8)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm font-semibold mb-1 flex items-center gap-1">
                        <Calendar size={16} />
                        Duration
                      </p>
                      <p className="text-sm">
                        {new Date(booking.checkInDate).toLocaleDateString()} -{' '}
                        {new Date(booking.checkOutDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm font-semibold mb-1">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 text-sm font-semibold mb-1">Total Cost</p>
                      <p className="text-2xl font-bold text-red-500">
                        ${booking.totalPrice || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No bookings yet</p>
              <button
                onClick={() => navigate('/')}
                className="btn-primary"
              >
                Start Exploring
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
