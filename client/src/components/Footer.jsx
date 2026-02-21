import { Github, Twitter, Facebook, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container-max py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">RoomLink</h3>
            <p className="text-gray-400 text-sm">
              Find your perfect hostel stay. Connect with travelers worldwide.
            </p>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Safety</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <Twitter size={20} className="cursor-pointer hover:text-gray-400" />
              <Facebook size={20} className="cursor-pointer hover:text-gray-400" />
              <Instagram size={20} className="cursor-pointer hover:text-gray-400" />
              <Github size={20} className="cursor-pointer hover:text-gray-400" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <p>&copy; 2026 RoomLink. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
