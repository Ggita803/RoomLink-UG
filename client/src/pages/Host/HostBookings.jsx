import { useEffect, useState } from 'react'
import { CalendarDays, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'
import { DashboardLayout, DataTable } from '../../components/dashboard'
import useHostelStore from '../../store/hostelStore'
import {
  Building2,
  LayoutDashboard,
  Star,
  Settings,
} from 'lucide-react'

const sidebarItems = [
  { path: '/host/dashboard', label: 'Overview', icon: LayoutDashboard },
  { divider: true, label: 'Management' },
  { path: '/host/hostels', label: 'My Hostels', icon: Building2 },
  { path: '/host/bookings', label: 'Bookings', icon: CalendarDays },
  { path: '/host/reviews', label: 'Reviews', icon: Star },
  { divider: true, label: 'Account' },
  { path: '/profile', label: 'Settings', icon: Settings },
]

const STATUS_STYLES = {
  confirmed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  checked_in: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
  completed: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle },
}

export default function HostBookings() {
  const { bookings, pagination, loading, fetchHostBookings } = useHostelStore()
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchHostBookings(1, statusFilter)
  }, [fetchHostBookings, statusFilter])

  const columns = [
    {
      key: 'bookingNumber',
      label: 'Booking #',
      sortable: true,
      accessor: (row) => row.bookingNumber || row._id?.slice(-8),
      render: (row) => (
        <span className="font-mono text-sm font-semibold">
          {row.bookingNumber || row._id?.slice(-8)}
        </span>
      ),
    },
    {
      key: 'guest',
      label: 'Guest',
      accessor: (row) => row.user?.name || row.userName || '—',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.user?.name || row.userName || '—'}</p>
          <p className="text-xs text-gray-500">{row.user?.email || row.userEmail || ''}</p>
        </div>
      ),
    },
    {
      key: 'dates',
      label: 'Dates',
      accessor: 'checkInDate',
      render: (row) => (
        <div className="text-sm">
          <p>{new Date(row.checkInDate).toLocaleDateString()}</p>
          <p className="text-gray-400">to {new Date(row.checkOutDate).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      accessor: 'totalPrice',
      sortable: true,
      render: (row) => (
        <span className="font-semibold">${row.totalPrice?.toLocaleString() || '0'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      accessor: 'status',
      render: (row) => {
        const style = STATUS_STYLES[row.status] || STATUS_STYLES.pending
        const Icon = style.icon
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
            <Icon size={12} />
            {row.status}
          </span>
        )
      },
    },
  ]

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarHeader="Host Panel">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage booking requests</p>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 mb-4">
        {['', 'pending', 'confirmed', 'checked_in', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              statusFilter === status
                ? 'bg-red-50 border-red-300 text-red-600'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {status ? status.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase()) : 'All'}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        searchable
        searchPlaceholder="Search bookings..."
        emptyIcon={CalendarDays}
        emptyTitle="No bookings"
        emptyDescription={statusFilter ? `No ${statusFilter} bookings found.` : 'No bookings yet.'}
      />
    </DashboardLayout>
  )
}
