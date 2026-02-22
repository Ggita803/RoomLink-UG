import { useEffect, useState } from 'react'
import { Star, MessageSquare } from 'lucide-react'
import { DashboardLayout } from '../../components/dashboard'
import useHostelStore from '../../store/hostelStore'
import {
  Building2,
  LayoutDashboard,
  CalendarDays,
  Star as StarIcon,
  Settings,
} from 'lucide-react'

const sidebarItems = [
  { path: '/host/dashboard', label: 'Overview', icon: LayoutDashboard },
  { divider: true, label: 'Management' },
  { path: '/host/hostels', label: 'My Hostels', icon: Building2 },
  { path: '/host/bookings', label: 'Bookings', icon: CalendarDays },
  { path: '/host/reviews', label: 'Reviews', icon: StarIcon },
  { divider: true, label: 'Account' },
  { path: '/profile', label: 'Settings', icon: Settings },
]

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
        />
      ))}
    </div>
  )
}

export default function HostReviews() {
  const { hostels, reviews, loading, fetchMyHostels, fetchHostelReviews } = useHostelStore()
  const [selectedHostel, setSelectedHostel] = useState('')

  useEffect(() => {
    fetchMyHostels()
  }, [fetchMyHostels])

  useEffect(() => {
    if (selectedHostel) {
      fetchHostelReviews(selectedHostel)
    }
  }, [selectedHostel, fetchHostelReviews])

  useEffect(() => {
    if (hostels.length > 0 && !selectedHostel) {
      setSelectedHostel(hostels[0]._id)
    }
  }, [hostels, selectedHostel])

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '—'

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarHeader="Host Panel">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Guest Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">See what guests are saying about your hostels</p>
      </div>

      {/* Hostel Selector */}
      {hostels.length > 1 && (
        <div className="mb-6">
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
          >
            {hostels.map((h) => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Average Rating</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">{avgRating}</span>
            <Star size={24} className="text-yellow-500 fill-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Total Reviews</p>
          <span className="text-3xl font-bold">{reviews.length}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">5-Star Reviews</p>
          <span className="text-3xl font-bold">{reviews.filter((r) => r.rating === 5).length}</span>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {review.user?.name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              {review.comment && (
                <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <MessageSquare size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-1">Reviews will appear here after guests check out</p>
        </div>
      )}
    </DashboardLayout>
  )
}
