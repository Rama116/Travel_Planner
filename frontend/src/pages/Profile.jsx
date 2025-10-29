import { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import api from '../utils/api.js'
import TripCard from '../components/TripCard.jsx'
import { fetchTrips } from '../store/slices/tripsSlice.js'
import { Bar } from 'react-chartjs-2'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function Profile() {
  const dispatch = useDispatch()
  const { items: trips } = useSelector((s) => s.trips)
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('All')

  useEffect(() => {
    dispatch(fetchTrips())
    api.get('/auth/me').then(({ data }) => setUser(data.user)).catch(()=>{})
  }, [dispatch])

  const { upcoming, past } = useMemo(() => {
    const now = Date.now()
    const toRangeEnd = (t) => {
      const ends = (t.destinations || []).map((d) => new Date(d.endDate).getTime())
      return ends.length ? Math.max(...ends) : new Date(t.createdAt).getTime()
    }
    const upcomingList = trips.filter((t) => toRangeEnd(t) >= now)
    const pastList = trips.filter((t) => toRangeEnd(t) < now)
    return { upcoming: upcomingList, past: pastList }
  }, [trips])

  const filtered = tab === 'All' ? trips : tab === 'Upcoming' ? upcoming : past

  const compareData = useMemo(() => {
    const labels = (past.length ? past : trips).map(t => t.title)
    const values = (past.length ? past : trips).map(t => (t.expenses||[]).reduce((s,e)=> s + Number(e.amount||0), 0))
    return { labels, datasets: [{ label: 'Total Spent', data: values, backgroundColor: '#111827' }] }
  }, [trips, past])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* decorative blobs to match app theme */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-gray-900 opacity-5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gray-900 opacity-5 rounded-full pointer-events-none" />

      {/* centered page container */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* profile card */}
        <div className="bg-white/80 backdrop-blur border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-semibold text-lg">
              {user?.name?.slice(0,1) || 'U'}
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-900">{user?.name || 'Your Profile'}</div>
              <div className="text-sm text-gray-600">{user?.email}</div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <div className="text-sm text-gray-500">View:</div>
                {['All','Upcoming','Past'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-1.5 rounded-full border ${tab === t ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* mobile tabs under profile info */}
          <div className="mt-4 flex gap-2 sm:hidden">
            {['All','Upcoming','Past'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-full border ${tab === t ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* comparison chart card */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="font-medium text-gray-800 mb-2">Past Trips Comparison</div>
          <div className="h-64">
            <Bar
              data={compareData}
              options={{
                plugins: { legend: { display: false } },
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        {/* trips grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((trip) => (
            <div key={trip._id} className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm">
              {/* keep TripCard as-is inside a card wrapper for consistent spacing */}
              <TripCard trip={trip} />
            </div>
          ))}

          {!filtered.length && (
            <div className="col-span-full text-gray-600 border-2 border-gray-200 rounded-2xl p-6 bg-white">
              No trips to show here yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
