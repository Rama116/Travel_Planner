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
      {/* soft blobs */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-gray-900 opacity-5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gray-900 opacity-5 rounded-full pointer-events-none" />

      {/* Responsive Header */}
      <header className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 justify-between">
          <Link to="/" className="inline-flex items-center gap-3 mb-2 sm:mb-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200">
              <span className="text-xs font-medium text-gray-700">Travel Planner</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 hidden sm:inline">Plan your trips</span>
          </Link>

          <nav className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-800 flex-grow sm:flex-grow-0 text-center"
            >
              Home
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-800 flex-grow sm:flex-grow-0 text-center"
                >
                  Trips
                </Link>
                <Link
                  to="/trips/new"
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 flex-grow sm:flex-grow-0 text-center"
                >
                  New Trip
                </Link>
                <Link
                  to="/profile"
                  className="ml-1 h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800"
                  aria-label="Profile"
                  style={{ minWidth: 40, minHeight: 40 }}
                >
                  {user.name?.slice(0, 1) || 'U'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 flex-grow sm:flex-grow-0 text-center"
                  style={{ minWidth: 40 }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 flex-grow sm:flex-grow-0 text-center"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-8">
          <div className="bg-transparent">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} Travel Planner
        </div>
      </footer>
    </div>
  )
}
