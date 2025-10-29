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
    <div className="min-h-screen flex flex-col bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(0,0,0,0.03),transparent)]">
      <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-semibold text-gray-900">Travel Planner</Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/dashboard" className="px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-800">Dashboard</Link>
                <Link to="/profile" className="px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-800">Profile</Link>
                <Link to="/trips/new" className="px-3 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-800">New Trip</Link>
                <Link to="/profile" className="ml-1 h-9 w-9 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800">
                  {user.name?.slice(0,1) || 'U'}
                </Link>
                <button onClick={handleLogout} className="px-3 py-1.5 rounded-md text-gray-700 hover:bg-gray-100">Logout</button>
              </>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-gray-900">Login</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      <footer className="border-t bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-gray-500">© {new Date().getFullYear()} Travel Planner</div>
      </footer>
    </div>
  )
}


