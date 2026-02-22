import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, Building2, DollarSign, Star, Users, AlertCircle, TrendingUp, Plus } from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../config/api'
import toast from 'react-hot-toast'

export default function HostDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'host') {
      navigate('/dashboard')
      return
    }

    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard/host')
        setDashboard(data.data)
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [user, navigate])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  const stats = dashboard || {}
  const totalRevenue = stats.revenue?.total || 0
  const totalBookings = stats.bookings?.total || 0
  const totalHostels = stats.hostels || 0
  const openComplaints = stats.complaints?.open || 0
  const avgRating = stats.reviews?.avgRating || 0
  const totalReviews = stats.reviews?.total || 0

  const bookingsByStatus = (stats.bookings?.byStatus || []).reduce((acc, item) => {
    acc[item._id] = item.count
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-max py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Host Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}!</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/host/add-hostel"
              className="flex items-center gap-2 btn-primary px-5 py-2.5"
            >
              <Plus size={18} />
              Add Hostel
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 border border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 size={20} className="text-blue-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">My Hostels</span>
            </div>
            <p className="text-3xl font-bold">{totalHostels}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">Total Revenue</span>
            </div>
            <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-purple-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">Total Bookings</span>
            </div>
            <p className="text-3xl font-bold">{totalBookings}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star size={20} className="text-yellow-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">Avg Rating</span>
            </div>
            <p className="text-3xl font-bold">{avgRating} <span className="text-sm text-gray-500 font-normal">({totalReviews} reviews)</span></p>
          </div>
        </div>

        {/* Booking Status + Complaints */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Booking Status Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={22} />
              Booking Status
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Confirmed', key: 'confirmed', color: 'bg-green-500' },
                { label: 'Pending', key: 'pending', color: 'bg-yellow-500' },
                { label: 'Checked In', key: 'checked_in', color: 'bg-blue-500' },
                { label: 'Completed', key: 'completed', color: 'bg-gray-500' },
                { label: 'Cancelled', key: 'cancelled', color: 'bg-red-500' },
              ].map(({ label, key, color }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`}></div>
                    <span className="text-gray-700">{label}</span>
                  </div>
                  <span className="font-semibold">{bookingsByStatus[key] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & Complaints */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={22} />
              Alerts & Quick Actions
            </h2>

            {openComplaints > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-semibold">
                  {openComplaints} open complaint{openComplaints > 1 ? 's' : ''} need attention
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to="/host/hostels"
                className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Manage My Hostels
              </Link>
              <Link
                to="/host/bookings"
                className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                View All Bookings
              </Link>
              <Link
                to="/host/reviews"
                className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Guest Reviews
              </Link>
            </div>
          </div>
        </div>

        {/* No Hostels CTA */}
        {totalHostels === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
            <Building2 size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No Hostels Yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first property to begin receiving bookings.</p>
            <Link to="/host/add-hostel" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
              <Plus size={18} />
              Add Your First Hostel
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
