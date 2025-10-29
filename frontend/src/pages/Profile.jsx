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

  // helper: get trip start & end timestamps
  const getRange = (t) => {
    // collect candidate starts and ends
    const starts = []
    const ends = []

    if (t.tripStartDate) starts.push(new Date(t.tripStartDate).getTime())
    if (t.tripEndDate) ends.push(new Date(t.tripEndDate).getTime())

    const dests = t.destinations || []
    for (const d of dests) {
      if (d.startDate) starts.push(new Date(d.startDate).getTime())
      if (d.endDate) ends.push(new Date(d.endDate).getTime())
    }

    // fallback to createdAt if nothing else
    const created = t.createdAt ? new Date(t.createdAt).getTime() : Date.now()

    const startTime = starts.length ? Math.min(...starts) : created
    const endTime = ends.length ? Math.max(...ends) : created

    return { startTime, endTime }
  }

  // categorize trips into upcoming, ongoing, past
  const { upcoming, ongoing, past } = useMemo(() => {
    const now = Date.now()
    const up = []
    const on = []
    const pa = []

    for (const t of trips) {
      const { startTime, endTime } = getRange(t)
      if (endTime < now) {
        pa.push(t)
      } else if (startTime > now) {
        up.push(t)
      } else {
        // start <= now <= end
        on.push(t)
      }
    }

    // optionally, sort each group by start date (soonest first)
    const sortByStart = (arr) => arr.slice().sort((a,b) => getRange(a).startTime - getRange(b).startTime)
    return { upcoming: sortByStart(up), ongoing: sortByStart(on), past: sortByStart(pa) }
  }, [trips])

  const filtered = useMemo(() => {
    if (tab === 'All') return trips
    if (tab === 'Upcoming') return upcoming
    if (tab === 'Ongoing') return ongoing
    if (tab === 'Past') return past
    return trips
  }, [tab, trips, upcoming, ongoing, past])

  // chart uses past trips (same as before)
  const compareData = useMemo(() => {
    const source = (past.length ? past : trips)
    const labels = source.map(t => t.title)
    const values = source.map(t => (t.expenses||[]).reduce((s,e)=> s + Number(e.amount||0), 0))
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
                {['All','Upcoming','Ongoing','Past'].map((t) => (
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
            {['All','Upcoming','Ongoing','Past'].map((t) => (
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
