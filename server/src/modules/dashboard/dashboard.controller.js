const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const User = require("../user/user.model");
const Hostel = require("../hostel/hostel.model");
const Booking = require("../booking/booking.model");
const Complaint = require("../complaint/complaint.model");
const Payment = require("../payment/payment.model");
const Review = require("../review/review.model");
const logger = require("../../config/logger");

/**
 * Dashboard Controller
 * Returns analytics and operational metrics
 */

/**
 * GET - Admin Dashboard
 * Returns platform-wide metrics and statistics
 */
const getAdminDashboard = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  // Build date filter
  let dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  // Users
  const userStats = await User.aggregate([
    { $match: dateFilter },
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);
  const totalUsers = await User.countDocuments(dateFilter);

  // Hostels (no date filter)
  const totalHostels = await Hostel.countDocuments();

  // Bookings
  const totalBookings = await Booking.countDocuments(dateFilter);
  const bookingStats = await Booking.aggregate([
    { $match: dateFilter },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  // Monthly bookings trend
  const monthlyBookings = await Booking.aggregate([
    { $match: dateFilter },
    { $group: {
      _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
      count: { $sum: 1 },
    } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Complaints
  const openComplaints = await Complaint.countDocuments({ ...dateFilter, status: "open" });
  const highPriorityComplaints = await Complaint.countDocuments({ ...dateFilter, status: "open", priority: "high" });

  // Revenue
  const payments = await Payment.aggregate([
    { $match: { ...dateFilter, status: "completed" } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" }, totalTransactions: { $sum: 1 } } },
  ]);
  // Monthly revenue trend
  const monthlyRevenue = await Payment.aggregate([
    { $match: { ...dateFilter, status: "completed" } },
    { $group: {
      _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
      revenue: { $sum: "$amount" },
      transactions: { $sum: 1 },
    } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Recent bookings
  const recentBookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "name email")
    .populate("hostel", "name")
    .select("_id user hostel checkInDate checkOutDate status createdAt");

  // Average hostel rating
  const avgRating = await Hostel.aggregate([
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$averageRating" },
      },
    },
  ]);

  // Active vs inactive hostels
  const activeHostels = await Hostel.countDocuments({ accountStatus: "Active" });
  const inactiveHostels = await Hostel.countDocuments({ accountStatus: "Inactive" });

  const dashboard = {
    summary: {
      totalUsers,
      totalHostels,
      totalBookings,
      totalRevenue: payments[0]?.totalRevenue || 0,
      totalTransactions: payments[0]?.totalTransactions || 0,
    },
    users: {
      byRole: userStats,
      total: totalUsers,
    },
    bookings: {
      byStatus: bookingStats,
      total: totalBookings,
      monthlyTrend: monthlyBookings,
    },
    revenue: {
      monthlyTrend: monthlyRevenue,
      total: payments[0]?.totalRevenue || 0,
    },
    complaints: {
      openCount: openComplaints,
      highPriorityCount: highPriorityComplaints,
    },
    hostels: {
      active: activeHostels,
      inactive: inactiveHostels,
      avgRating: avgRating[0]?.averageRating || 0,
    },
  };

  logger.info(`Admin dashboard accessed by ${req.user._id}`);

  return res.status(200).json(
    new ApiResponse(200, dashboard, "Admin dashboard retrieved successfully")
  );
});

/**
 * GET - Host Dashboard with date filters and trends
 * GET /api/v1/dashboard/host?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
const getHostDashboard = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const hostId = req.user._id;
  let dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }
  // Get all hostels for this host
  const hostels = await Hostel.find({ owner: hostId }).select("_id name totalReviews averageRating");
  if (hostels.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, {
        hostels: [],
        bookings: 0,
        revenue: 0,
        complaints: 0,
        avgOccupancy: 0,
        reviews: 0,
      }, "No hostels found for this host")
    );
  }
  const hostelIds = hostels.map((h) => h._id);
  // Bookings
  const totalBookings = await Booking.countDocuments({ hostel: { $in: hostelIds }, ...dateFilter });
  const bookingStats = await Booking.aggregate([
    { $match: { hostel: { $in: hostelIds }, ...dateFilter } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  // Monthly bookings trend
  const monthlyBookings = await Booking.aggregate([
    { $match: { hostel: { $in: hostelIds }, ...dateFilter } },
    { $group: {
      _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
      count: { $sum: 1 },
    } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);
  // Revenue
  const revenueData = await Booking.aggregate([
    { $match: { hostel: { $in: hostelIds }, status: { $in: ["completed", "checked_out"] }, ...dateFilter } },
    { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
  ]);
  // Monthly revenue trend
  const monthlyRevenue = await Booking.aggregate([
    { $match: { hostel: { $in: hostelIds }, status: { $in: ["completed", "checked_out"] }, ...dateFilter } },
    { $group: {
      _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
      revenue: { $sum: "$totalPrice" },
    } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);
  // Complaints
  const totalComplaints = await Complaint.countDocuments({ hostel: { $in: hostelIds }, ...dateFilter });
  const openComplaints = await Complaint.countDocuments({ hostel: { $in: hostelIds }, status: "open", ...dateFilter });
  // Reviews
  const totalReviews = hostels.reduce((sum, h) => sum + (h.totalReviews || 0), 0);
  const avgRating = hostels.reduce((sum, h) => sum + h.averageRating, 0) / hostels.length || 0;
  const dashboard = {
    hostels: hostels.length,
    bookings: {
      total: totalBookings,
      byStatus: bookingStats,
      monthlyTrend: monthlyBookings,
    },
    revenue: {
      total: revenueData[0]?.totalRevenue || 0,
      monthlyTrend: monthlyRevenue,
    },
    complaints: {
      total: totalComplaints,
      open: openComplaints,
    },
    reviews: {
      total: totalReviews,
      avgRating: parseFloat(avgRating.toFixed(2)),
    },
  };
  logger.info(`Host dashboard accessed by ${hostId}`);
  return res.status(200).json(
    new ApiResponse(200, dashboard, "Host dashboard retrieved successfully")
  );
});

/**
 * GET - Staff Dashboard with date filters and trends
 * GET /api/v1/dashboard/staff?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
const getStaffDashboard = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const staffId = req.user._id;
  let dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }
  // Complaints assigned to staff
  const assignedComplaints = await Complaint.countDocuments({ handledBy: staffId, ...dateFilter });
  const openAssigned = await Complaint.countDocuments({ handledBy: staffId, status: "open", ...dateFilter });
  const inProgress = await Complaint.countDocuments({ handledBy: staffId, status: "in-progress", ...dateFilter });
  const resolvedCount = await Complaint.countDocuments({ handledBy: staffId, status: "resolved", ...dateFilter });
  // Complaints by category
  const complaintsByCategory = await Complaint.aggregate([
    { $match: { handledBy: staffId, ...dateFilter } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  // Complaints by priority
  const complaintsByPriority = await Complaint.aggregate([
    { $match: { handledBy: staffId, ...dateFilter } },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
  ]);
  // Resolution time metrics
  const resolutionMetrics = await Complaint.aggregate([
    { $match: { handledBy: staffId, status: "resolved", resolutionDate: { $exists: true }, ...dateFilter } },
    { $project: {
      resolutionTime: {
        $divide: [
          { $subtract: ["$resolutionDate", "$createdAt"] },
          1000 * 60 * 60 * 24,
        ],
      },
    } },
    { $group: {
      _id: null,
      avgResolutionTime: { $avg: "$resolutionTime" },
      minResolutionTime: { $min: "$resolutionTime" },
      maxResolutionTime: { $max: "$resolutionTime" },
    } },
  ]);
  // Monthly complaints trend
  const monthlyComplaints = await Complaint.aggregate([
    { $match: { handledBy: staffId, ...dateFilter } },
    { $group: {
      _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
      count: { $sum: 1 },
    } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);
  // Recent complaints
  const recentComplaints = await Complaint.find({ handledBy: staffId, ...dateFilter })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "name")
    .populate("hostel", "name")
    .select("_id title category priority status createdAt");
  const dashboard = {
    assigned: assignedComplaints,
    status: {
      open: openAssigned,
      inProgress,
      resolved: resolvedCount,
    },
    byCategory: complaintsByCategory,
    byPriority: complaintsByPriority,
    metrics: {
      avgResolutionTime: resolutionMetrics[0]?.avgResolutionTime || 0,
      minResolutionTime: resolutionMetrics[0]?.minResolutionTime || 0,
      maxResolutionTime: resolutionMetrics[0]?.maxResolutionTime || 0,
    },
    monthlyTrend: monthlyComplaints,
    recent: recentComplaints,
  };
  logger.info(`Staff dashboard accessed by ${staffId}`);
  return res.status(200).json(
    new ApiResponse(200, dashboard, "Staff dashboard retrieved successfully")
  );
});

module.exports = {
  getAdminDashboard,
  getHostDashboard,
  getStaffDashboard,
};
