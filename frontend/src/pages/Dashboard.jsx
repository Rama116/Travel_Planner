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
    <div>
      <div className="rounded-2xl border card bg-gradient-to-br from-white to-gray-50 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Your Trips</h1>
            <p className="text-gray-600">Plan, track, and revisit your adventures.</p>
          </div>
          <Link to="/trips/new" className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800">Create Trip</Link>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((t) => (
          <TripCard key={t._id} trip={t} />
        ))}
        {!items.length && (
          <div className="col-span-full text-center border rounded-2xl p-10 bg-white">
            <div className="text-lg font-medium text-gray-900">No trips yet</div>
            <div className="text-gray-600 mt-1">Click Create Trip to get started.</div>
          </div>
        )}
      </div>
    </div>
  )
}


