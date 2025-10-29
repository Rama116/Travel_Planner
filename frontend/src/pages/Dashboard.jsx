import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchTrips } from '../store/slices/tripsSlice.js'
import TripCard from '../components/TripCard.jsx'

export default function Dashboard() {
  const dispatch = useDispatch()
  const { items } = useSelector((s) => s.trips)

  useEffect(() => {
    dispatch(fetchTrips())
  }, [dispatch])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* decorative blobs to match the app theme */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-gray-900 opacity-5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gray-900 opacity-5 rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Your Trips</h1>
              <p className="text-gray-600">Plan, track, and revisit your adventures.</p>
            </div>
            <Link
              to="/trips/new"
              className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
            >
              Create Trip
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {items.map((t) => (
            <div key={t._id} className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm">
              <TripCard trip={t} />
            </div>
          ))}

          {!items.length && (
            <div className="col-span-full text-center border-2 border-gray-200 rounded-2xl p-10 bg-white">
              <div className="text-lg font-medium text-gray-900">No trips yet</div>
              <div className="text-gray-600 mt-1">Click Create Trip to get started.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
