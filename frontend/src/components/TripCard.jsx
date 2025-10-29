import { Link } from 'react-router-dom'

export default function TripCard({ trip }) {
  const dest = (trip.destinations || [])
  const start = dest.length ? new Date(dest[0].startDate) : new Date(trip.createdAt)
  const end = dest.length ? new Date(dest[dest.length-1].endDate) : new Date(trip.createdAt)

  return (
    <Link to={`/trips/${trip._id}`} className="group relative overflow-hidden rounded-2xl border card bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_400px_at_100%_-10%,rgba(17,24,39,0.08),transparent)] transition"/>
      <div className="p-5 relative">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wide text-gray-500">Trip</div>
          <div className="text-xs text-gray-500">{start.toLocaleDateString()} – {end.toLocaleDateString()}</div>
        </div>
        <div className="mt-1 text-lg font-semibold text-gray-900">{trip.title}</div>
        {!!dest.length && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {dest.map((d, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full border bg-white text-gray-700">{d.name}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}


