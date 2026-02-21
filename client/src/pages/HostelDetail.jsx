import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Star, Wifi, Users, DollarSign, Heart } from 'lucide-react'
import api from '../config/api'
import toast from 'react-hot-toast'

export default function HostelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [hostel, setHostel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const fetchHostel = async () => {
      try {
        const { data } = await api.get(`/hostels/${id}`)
        setHostel(data.data)

        // Fetch rooms for this hostel
        const roomsData = await api.get(`/hostels/${id}/rooms`)
        setRooms(roomsData.data.data || [])
      } catch (error) {
        toast.error('Failed to load hostel details')
      } finally {
        setLoading(false)
      }
    }

    fetchHostel()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading hostel details...</p>
        </div>
      </div>
    )
  }

  if (!hostel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Hostel not found</p>
      </div>
    )
  }

  const images = hostel.images || [{ url: 'https://via.placeholder.com/800x600' }]

  return (
    <div className="min-h-screen bg-white">
      <div className="container-max py-8">
        {/* Gallery */}
        <div className="mb-8">
          <div className="relative h-96 bg-gray-200 rounded-xl overflow-hidden mb-4">
            <img
              src={images[selectedImageIndex]?.url}
              alt={hostel.name}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                    selectedImageIndex === idx ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-3">{hostel.name}</h1>
              <div className="flex items-center gap-4 flex-wrap mb-4">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-gray-600" />
                  <span className="text-gray-600">
                    {hostel.city}, {hostel.country}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={20} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">
                    {hostel.averageRating?.toFixed(1) || 'New'}
                  </span>
                  <span className="text-gray-600">({hostel.totalReviews || 0} reviews)</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">About</h3>
              <p className="text-gray-700 leading-relaxed">{hostel.description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hostel.amenities?.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <Wifi size={20} className="text-red-500" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Rooms */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Available Rooms</h3>
              <div className="space-y-4">
                {rooms.length > 0 ? (
                  rooms.map((room) => (
                    <div key={room._id} className="card p-6 flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg mb-2">{room.roomType}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users size={16} />
                            {room.capacity} guests
                          </div>
                          <div>{room.totalBeds} beds</div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{room.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold mb-3">
                          ${room.pricePerNight}
                          <span className="text-base text-gray-600">/night</span>
                        </div>
                        <button
                          onClick={() => navigate(`/booking/${room._id}`)}
                          className="btn-primary"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No rooms available</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card p-6 sticky top-20">
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-2">Price per night</p>
                <p className="text-4xl font-bold">
                  ${hostel.minPrice || 'Contact'}
                  <span className="text-lg text-gray-600">/night</span>
                </p>
              </div>

              <button className="w-full btn-primary py-3 mb-3 font-semibold">
                Check Availability
              </button>

              <button className="w-full btn-secondary py-3 flex items-center justify-center gap-2 font-semibold">
                <Heart size={20} />
                Save
              </button>

              {/* Contact Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-bold mb-3">Contact Host</h4>
                <button className="w-full bg-gray-100 py-2 rounded-lg mb-2 text-sm font-semibold hover:bg-gray-200">
                  Message Host
                </button>
                <button className="w-full bg-gray-100 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200">
                  Call Host
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
