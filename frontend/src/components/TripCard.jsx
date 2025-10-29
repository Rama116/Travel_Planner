import { Link } from 'react-router-dom'

export default function TripCard({ trip }) {
  const dest = trip.destinations || []
  const start = dest.length ? new Date(dest[0].startDate) : new Date(trip.createdAt)
  const end = dest.length ? new Date(dest[dest.length - 1].endDate) : new Date(trip.createdAt)

  return (
    <Link
      to={`/trips/${trip._id}`}
      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-gray-50 to-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* background glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(600px_300px_at_90%_-10%,rgba(0,0,0,0.05),transparent)] transition-opacity duration-500" />

      <div className="p-5 relative z-10">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">
            Trip
          </div>
          <div className="text-xs text-gray-500">
            {start.toLocaleDateString()} – {end.toLocaleDateString()}
          </div>
        </div>

        {/* title */}
        <div className="mt-1 text-lg font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">
          {trip.title}
        </div>

        {/* destinations */}
        {!!dest.length && (
          <div className="mt-3 flex flex-wrap gap-2">
            {dest.map((d, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-full border border-gray-200 bg-white/80 text-gray-700 backdrop-blur-sm hover:bg-gray-100 transition"
              >
                {d.name}
              </span>
            ))}
          </div>
        )}

        {/* subtle footer line */}
        <div className="mt-4 border-t border-gray-100 pt-2 text-xs text-gray-500">
          {dest.length ? `${dest.length} destinations` : 'No destinations added'}
        </div>
      </div>
    </Link>
  )
}
