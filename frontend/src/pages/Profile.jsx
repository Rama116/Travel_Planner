import { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import api from '../utils/api.js'
import TripCard from '../components/TripCard.jsx'
import { fetchTrips } from '../store/slices/tripsSlice.js'

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

  return (
    <div className="space-y-6">
      <div className="card border rounded-2xl p-6 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-semibold">
            {user?.name?.slice(0,1) || 'U'}
          </div>
          <div>
            <div className="text-xl font-semibold text-gray-900">{user?.name || 'Your Profile'}</div>
            <div className="text-sm text-gray-600">{user?.email}</div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {['All','Upcoming','Past'].map((t)=>(
            <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 rounded-full border ${tab===t? 'bg-gray-900 text-white border-gray-900':'bg-white text-gray-700 hover:bg-gray-50'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((trip) => (
          <TripCard key={trip._id} trip={trip} />
        ))}
        {!filtered.length && (
          <div className="col-span-full text-gray-600 border rounded-2xl p-6 bg-white">No trips to show here yet.</div>
        )}
      </div>
    </div>
  )
}


