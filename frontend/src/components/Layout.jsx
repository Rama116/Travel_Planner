import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice.js'

export default function Layout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* soft decorative blobs (same style as auth pages) */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-gray-900 opacity-5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gray-900 opacity-5 rounded-full pointer-events-none" />

      {/* header */}
      <header className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200">
              <span className="text-xs font-medium text-gray-700">Travel Planner</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 hidden sm:inline">Plan your trips</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              to="/"
              className="px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-800"
            >
              Home
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-800"
                >
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  className="px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-800"
                >
                  Profile
                </Link>

                <Link
                  to="/trips/new"
                  className="px-3 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-800"
                >
                  New Trip
                </Link>

                <Link
                  to="/profile"
                  className="ml-1 h-9 w-9 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800"
                  aria-label="Profile"
                >
                  {user.name?.slice(0, 1) || 'U'}
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-gray-900">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* main content area with the same centered max-width container */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Wrap Outlet in a subtle card container to match the app's look when needed */}
          <div className="bg-transparent">
            <Outlet />
          </div>
        </div>
      </main>

      {/* footer that matches the auth pages' subtle style */}
      <footer className="border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-gray-500">
          © {new Date().getFullYear()} Travel Planner
        </div>
      </footer>
    </div>
  )
}
