import { useState, useEffect } from 'react'
import { MapPin, Star, DollarSign } from 'lucide-react'
import HostelCard from '../components/HostelCard'
import useBookingStore from '../store/bookingStore'
import api from '../config/api'
import toast from 'react-hot-toast'

export default function Search() {
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 200,
    rating: 0,
  })

  const { city, checkInDate, checkOutDate } = useBookingStore()

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const params = new URLSearchParams()
        if (city) params.append('city', city)
        if (filters.priceMin) params.append('priceMin', filters.priceMin)
        if (filters.priceMax) params.append('priceMax', filters.priceMax)
        if (filters.rating) params.append('minRating', filters.rating)

        const { data } = await api.get(`/hostels/search?${params}`)
        setHostels(data.data || [])
      } catch (error) {
        toast.error('Failed to search hostels')
      } finally {
        setLoading(false)
      }
    }

    fetchHostels()
  }, [filters])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-max py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-20">
              <h3 className="font-bold text-lg mb-6">Filters</h3>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">Price Range</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <input
                      type="range"
                      min="0"
                      max="300"
                      value={filters.priceMax}
                      onChange={(e) =>
                        setFilters({ ...filters, priceMax: parseInt(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    ${filters.priceMin} - ${filters.priceMax}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">Minimum Rating</label>
                <div className="space-y-2">
                  {[0, 3, 4, 4.5].map((rating) => (
                    <label key={rating} className="flex items-center text-sm">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={filters.rating === rating}
                        onChange={() => setFilters({ ...filters, rating })}
                        className="mr-2"
                      />
                      {rating === 0 ? 'Any' : `${rating}+ ⭐`}
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-semibold mb-3">Amenities</label>
                <div className="space-y-2 text-sm">
                  {['WiFi', 'Kitchen', 'Laundry', 'Parking', 'Pool'].map((amenity) => (
                    <label key={amenity} className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">
                {city ? `Hostels in ${city}` : 'Search Results'}
              </h2>
              {checkInDate && checkOutDate && (
                <p className="text-gray-600">
                  {new Date(checkInDate).toLocaleDateString()} -{' '}
                  {new Date(checkOutDate).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Hostels Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="card h-96 bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : hostels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hostels.map((hostel) => (
                  <HostelCard key={hostel._id} hostel={hostel} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No hostels found matching your search</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
