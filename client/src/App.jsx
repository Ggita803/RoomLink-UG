import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'

// Public pages
import Home from './pages/Home'
import Search from './pages/Search'
import HostelDetail from './pages/HostelDetail'
import NotFound from './pages/NotFound'

// Auth pages
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import VerifyEmail from './pages/Auth/VerifyEmail'
import ResetPassword from './pages/Auth/ResetPassword'

// User pages (any authenticated user)
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Booking from './pages/Booking'
import Payment from './pages/Payment'
import Complaints from './pages/Complaints'

// Host pages
import HostDashboard from './pages/HostDashboard'
import HostHostels from './pages/Host/HostHostels'
import AddHostel from './pages/Host/AddHostel'
import EditHostel from './pages/Host/EditHostel'
import ManageRooms from './pages/Host/ManageRooms'
import HostBookings from './pages/Host/HostBookings'
import HostReviews from './pages/Host/HostReviews'

// Admin pages
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminUsers from './pages/Admin/AdminUsers'
import AdminComplaints from './pages/Admin/AdminComplaints'
import AdminReports from './pages/Admin/AdminReports'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/hostel/:id" element={<HostelDetail />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Authenticated User Routes */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/booking/:roomId" element={<PrivateRoute><Booking /></PrivateRoute>} />
            <Route path="/payment/:bookingId" element={<PrivateRoute><Payment /></PrivateRoute>} />
            <Route path="/complaints" element={<PrivateRoute><Complaints /></PrivateRoute>} />

            {/* Host Routes */}
            <Route path="/host/dashboard" element={<PrivateRoute roles={['host']}><HostDashboard /></PrivateRoute>} />
            <Route path="/host/hostels" element={<PrivateRoute roles={['host']}><HostHostels /></PrivateRoute>} />
            <Route path="/host/add-hostel" element={<PrivateRoute roles={['host']}><AddHostel /></PrivateRoute>} />
            <Route path="/host/hostels/:id/edit" element={<PrivateRoute roles={['host']}><EditHostel /></PrivateRoute>} />
            <Route path="/host/hostels/:hostelId/rooms" element={<PrivateRoute roles={['host']}><ManageRooms /></PrivateRoute>} />
            <Route path="/host/bookings" element={<PrivateRoute roles={['host']}><HostBookings /></PrivateRoute>} />
            <Route path="/host/reviews" element={<PrivateRoute roles={['host']}><HostReviews /></PrivateRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin', 'ADMIN', 'SUPER_ADMIN']}><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/users" element={<PrivateRoute roles={['admin', 'ADMIN', 'SUPER_ADMIN']}><AdminUsers /></PrivateRoute>} />
            <Route path="/admin/complaints" element={<PrivateRoute roles={['admin', 'ADMIN', 'SUPER_ADMIN', 'staff', 'STAFF']}><AdminComplaints /></PrivateRoute>} />
            <Route path="/admin/reports" element={<PrivateRoute roles={['admin', 'ADMIN', 'SUPER_ADMIN']}><AdminReports /></PrivateRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App
