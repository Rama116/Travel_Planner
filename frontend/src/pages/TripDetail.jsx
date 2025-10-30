import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import api from '../utils/api.js'
import { deleteTrip } from '../store/slices/tripsSlice.js'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

Chart.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)

function WeatherCard({ trip }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const tripCity = (trip.destinations?.[0]?.name) || ''
  const coords = trip.destinations?.[0] && trip.destinations[0].lat && trip.destinations[0].lng
  const [inputCity, setInputCity] = useState('')
  const [city, setCity] = useState(tripCity)

  // Support search bar for changing city
  function handleSearch(e) {
    e.preventDefault()
    if (inputCity.trim()) {
      setCity(inputCity.trim())
    } else {
      setCity(tripCity)
    }
  }

  useEffect(() => { setCity(tripCity) }, [tripCity])

  useEffect(() => {
    let cancelled = false
    async function fetchWeather() {
      setLoading(true); setError(''); setWeather(null)
      try {
        let lat, lon
        if (coords && !city) { lat = trip.destinations[0].lat; lon = trip.destinations[0].lng }
        if ((!lat || !lon) && city) {
          // basic geocoding for first part of city string
          const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.split(',')[0])}`)
          const gdata = await geo.json()
          if (gdata.results && gdata.results[0]) {
            lat = gdata.results[0].latitude; lon = gdata.results[0].longitude }
        }
        if (!lat || !lon) throw new Error('No city/coords found')
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const resp = await fetch(url)
        const data = await resp.json()
        if (cancelled) return
        if (data?.current_weather) setWeather({
          temp: data.current_weather.temperature,
          icon: data.current_weather.weathercode,
          wind: data.current_weather.windspeed,
          ts: data.current_weather.time,
        })
        else throw new Error('No weather data')
      } catch (e) { if (!cancelled) setError('Could not fetch weather!') }
      setLoading(false)
    }
    fetchWeather()
    return () => { cancelled = true }
  }, [city, coords])

  const codeToIcon = code =>{
    if(code===0) return '☀️';
    if([1,2].includes(code)) return '🌤️';
    if(code===3) return '☁️';
    if([45,48].includes(code)) return '🌫️';
    if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return '🌦️';
    if([71,73,75,77,85,86].includes(code)) return '❄️';
    if([95,96,99].includes(code)) return '🌩️';
    return '🌡️';
  }

  return (
    <div className="bg-white/80 border-2 border-gray-200 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-center sm:gap-6 min-h-[88px]">
      <form onSubmit={handleSearch} className="mb-2 sm:mb-0 flex flex-col sm:flex-row gap-2 sm:items-center w-full max-w-xs">
        <input 
          type="text"
          value={inputCity}
          onChange={e=>setInputCity(e.target.value)}
          onBlur={()=>{ if(!inputCity) setCity(tripCity) }}
          className="border-2 border-gray-200 rounded-md px-4 py-2 w-full focus:border-gray-900 outline-none transition bg-gray-50"
          placeholder="Search city for weather..."
          aria-label="Search city"
        />
        <button type="submit" className="px-3 py-2 rounded-md bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all">Search</button>
      </form>
      <div className="sm:ml-6 flex-1 max-w-md">
        <div className="font-semibold text-gray-900 text-base mb-1">
          Weather {city ? `in ${city.split(',')[0]}` : ''}
        </div>
        {loading ? (
          <div className="text-gray-700 animate-pulse h-5 w-24 bg-gray-100 rounded" />
        ) : error ? (
          <div className="text-gray-600">{error}</div>
        ) : weather ? (
          <div className="flex items-center gap-4 text-lg">
            <span className="text-2xl">{codeToIcon(weather.icon)}</span>
            <span className="text-gray-900 font-bold">{weather.temp}°C</span>
            <span className="text-gray-600">{weather.ts && new Date(weather.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="hidden sm:inline text-gray-400">Wind: {weather.wind}km/h</span>
          </div>
        ) : (
          <div className="text-gray-500">—</div>
        )}
      </div>
    </div>
  )
}

function ActivityCheckbox({ activity, tripId, onUpdate }) {
  const [loading, setLoading] = useState(false);
  async function handleChange(e) {
    setLoading(true);
    try {
      const { data } = await api.patch(`/trips/${tripId}/activities/${activity.id}/complete`, { completed: !activity.completed })
      if (data && data.activities) onUpdate(data.activities)
    } finally { setLoading(false); }
  }
  return (
    <input 
      type="checkbox" 
      checked={!!activity.completed} 
      onChange={handleChange} 
      disabled={loading}
      aria-label={activity.title + (activity.completed ? ' (completed)' : '')}
      className="mr-3 form-checkbox rounded border-gray-400 text-green-600 focus:ring-0 accent-green-600 h-5 w-5" 
      style={{ minWidth:20, minHeight:20 }}
    />
  )
}

function TripMap({ trip }) {
  const [geoPositions, setGeoPositions] = useState([])
  const [loadingGeo, setLoadingGeo] = useState(false)
  const [geoError, setGeoError] = useState('')

  const defaultSrc = (trip.destinations?.[0]?.name) || ''
  const defaultDst = (trip.destinations && trip.destinations[trip.destinations.length-1]?.name) || ''
  const [srcQuery, setSrcQuery] = useState(defaultSrc)
  const [dstQuery, setDstQuery] = useState(defaultDst)

  // Helper to geocode a place name -> {lat,lng,name}
  async function geocodeName(name) {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}`)
    const data = await res.json()
    if (data && data.results && data.results[0]) {
      const r = data.results[0]
      return { lat: r.latitude, lng: r.longitude, name }
    }
    throw new Error('Not found')
  }

  // Build initial positions from destinations: use provided lat/lng, else geocode by name
  useEffect(() => {
    let cancelled = false
    async function buildPositions() {
      setLoadingGeo(true); setGeoError('')
      try {
        const raw = (trip.destinations || [])
        if (!raw.length) { setGeoPositions([]); return }
        const results = []
        for (const d of raw) {
          if (d.lat && d.lng) results.push({ lat: d.lat, lng: d.lng, name: d.name })
          else if (d.name) {
            try { results.push(await geocodeName(d.name)) } catch {}
          }
        }
        if (!cancelled) setGeoPositions(results)
      } catch (e) {
        if (!cancelled) setGeoError('Could not resolve destinations')
      } finally { if (!cancelled) setLoadingGeo(false) }
    }
    buildPositions()
    return () => { cancelled = true }
  }, [trip.destinations])

  async function onSearch(e) {
    e.preventDefault()
    setLoadingGeo(true); setGeoError('')
    try {
      const pts = []
      if (srcQuery) pts.push(await geocodeName(srcQuery))
      if (dstQuery) pts.push(await geocodeName(dstQuery))
      // If both available, set route from src->dst; if only one, just show that marker
      setGeoPositions(pts)
    } catch (e) {
      setGeoError('Could not find one or both locations')
    } finally { setLoadingGeo(false) }
  }

  const hasPositions = geoPositions && geoPositions.length > 0
  const positions = geoPositions.map(p => [p.lat, p.lng])
  const start = hasPositions ? positions[0] : [0,0]
  const end = hasPositions ? positions[positions.length-1] : [0,0]

  function icon(color) { return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    iconSize: [25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowUrl:'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',shadowSize:[41,41]
  }) }

  return (
    <div className="bg-white/80 border-2 border-gray-200 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="font-semibold text-gray-900 text-base">Trip Route Map</div>
        <form onSubmit={onSearch} className="flex items-center gap-2 flex-wrap">
          <input value={srcQuery} onChange={e=>setSrcQuery(e.target.value)} placeholder="Source" className="border-2 border-gray-200 rounded-md px-3 py-1.5 text-sm bg-gray-50 focus:border-gray-900 outline-none" />
          <input value={dstQuery} onChange={e=>setDstQuery(e.target.value)} placeholder="Destination" className="border-2 border-gray-200 rounded-md px-3 py-1.5 text-sm bg-gray-50 focus:border-gray-900 outline-none" />
          <button type="submit" className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-800">Search</button>
        </form>
      </div>
      {loadingGeo && <div className="text-sm text-gray-600 mt-2">Resolving locations...</div>}
      {geoError && <div className="text-sm text-red-600 mt-2">{geoError}</div>}
      <div className="w-full h-[260px] rounded-xl overflow-hidden mt-3">
        {hasPositions ? (
          <MapContainer center={start} zoom={5} scrollWheelZoom={false} style={{width:'100%',height:'100%'}}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {positions.length > 1 ? <Polyline positions={positions} color="#2563eb" weight={4}/> : null}
            <Marker position={start} icon={icon('green')}>
              <Popup>Start: {geoPositions[0]?.name || 'Start'}</Popup>
            </Marker>
            {positions.length>1 && (
              <Marker position={end} icon={icon('red')}>
                <Popup>End: {geoPositions[geoPositions.length-1]?.name || 'End'}</Popup>
              </Marker>
            )}
            {geoPositions.slice(1,-1).map((p,i)=>(
              <Marker key={i} position={[p.lat,p.lng]} icon={icon('blue')}>
                <Popup>{p.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">No destination map data to display.</div>
        )}
      </div>
    </div>
  )
}

export default function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [trip, setTrip] = useState(null)
  const [selectedDay, setSelectedDay] = useState(1)
  const [dayCount, setDayCount] = useState(1)
  const [newActivity, setNewActivity] = useState('')
  const [newActivityType, setNewActivityType] = useState('other')
  const [newActivityTime, setNewActivityTime] = useState('10:00')
  const [newActivityNotes, setNewActivityNotes] = useState('')
  // <-- amount is an empty string so there's no default price
  const [newExpense, setNewExpense] = useState({ category: 'Food', amount: '' })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    api.get(`/trips/${id}`).then(({ data }) => { 
      setTrip(data.trip);
      // initialize days from dates or at least 1
      let initialDays = 1
      if (data.trip.tripStartDate && data.trip.tripEndDate) {
        const diff = (new Date(data.trip.tripEndDate) - new Date(data.trip.tripStartDate)) / 86400000
        initialDays = Math.max(1, Math.round(diff) + 1)
      } else if ((data.trip.destinations||[]).length) {
        const ends = data.trip.destinations.map(d => new Date(d.endDate).getTime())
        const starts = data.trip.destinations.map(d => new Date(d.startDate).getTime())
        if (starts.length && ends.length) {
          const diff = (Math.max(...ends) - Math.min(...starts)) / 86400000
          initialDays = Math.max(1, Math.round(diff) + 1)
        }
      }
      setDayCount(initialDays)
    })
  }, [id])

  async function addActivity() {
    if (!newActivity.trim()) return
    const activity = { id: crypto.randomUUID(), title: newActivity, day: selectedDay, time: newActivityTime, notes: newActivityNotes, type: newActivityType }
    const { data } = await api.post(`/trips/${id}/activities`, { activity })
    setTrip((t) => ({ ...t, activities: data.activities }))
    setNewActivity('')
    setNewActivityNotes('')
  }

  function onDragEnd(result) {
    if (!result.destination) return
    const items = Array.from(trip.activities)
    const [removed] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, removed)
    api.put(`/trips/${id}/activities/reorder`, { activities: items }).then(({ data }) =>
      setTrip((t) => ({ ...t, activities: data.activities }))
    )
  }

  async function addExpense() {
    // require user to enter a valid amount (no default)
    const amt = parseFloat(newExpense.amount)
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount greater than 0.')
      return
    }
    // Always associate day
    let date
    if (trip.tripStartDate) {
      const d = new Date(trip.tripStartDate)
      d.setDate(d.getDate() + (selectedDay - 1))
      date = d.toISOString()
    }
    const expense = { id: crypto.randomUUID(), category: newExpense.category, amount: amt, day: selectedDay }
    if (date) expense.date = date
    const { data } = await api.post(`/trips/${id}/expenses`, { expense })
    setTrip((t) => ({ ...t, expenses: data.expenses }))
    setNewExpense({ category: 'Food', amount: '' })
  }

  async function handleDelete() {
    try {
      await dispatch(deleteTrip(id)).unwrap()
      navigate('/dashboard')
    } catch (err) {
      alert('Failed to delete trip')
    }
  }

  const totalsByCategory = useMemo(() => {
    const sums = (trip?.expenses || []).reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})
    return sums
  }, [trip])

  const barData = useMemo(() => ({
    labels: Object.keys(totalsByCategory),
    datasets: [{ label: 'Expenses', data: Object.values(totalsByCategory), backgroundColor: '#111827' }]
  }), [totalsByCategory])

  const pieData = useMemo(() => ({
    labels: Object.keys(totalsByCategory),
    datasets: [{ data: Object.values(totalsByCategory), backgroundColor: ['#111827','#4b5563','#9ca3af','#d1d5db','#e5e7eb','#6b7280'] }]
  }), [totalsByCategory])

  function addDay() { setDayCount((c)=> c + 1) }

  const activitiesForDay = useMemo(() => (trip?.activities || []).filter(a => a.day === selectedDay), [trip, selectedDay])
  const expensesForDay = useMemo(() => {
    if (!trip?.expenses) return []
    return trip.expenses.filter(e => e.day === selectedDay)
  }, [trip, selectedDay])

  if (!trip) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* decorative blobs */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-gray-900 opacity-5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gray-900 opacity-5 rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-white/80 backdrop-blur border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{trip.title}</h1>
              <div className="text-sm text-gray-600 mt-1">{trip.destinations?.map(d=>d.name).join(', ')}</div>
              {(trip.tripStartDate || trip.tripEndDate) && (
                <div className="text-sm text-gray-600 mt-1">
                  Duration: {trip.tripStartDate ? new Date(trip.tripStartDate).toLocaleDateString() : '—'} → {trip.tripEndDate ? new Date(trip.tripEndDate).toLocaleDateString() : '—'}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                >
                  Delete Trip
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                  >
                    Confirm Delete
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <WeatherCard trip={trip} />
        <TripMap trip={trip}/>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="font-medium text-gray-900">Days</div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">{dayCount} days</div>
              <button onClick={addDay} className="px-2 py-1 rounded-md border text-sm hover:bg-gray-50">+ Add Day</button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: dayCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(i + 1)}
                className={`px-3 py-1.5 rounded-full border ${selectedDay === (i + 1) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50'}`}
              >
                Day {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-medium text-gray-900">Itinerary · Day {selectedDay}</h2>
              <div className="flex flex-wrap gap-2 justify-end">
                <select value={newActivityType} onChange={(e)=>setNewActivityType(e.target.value)} className="border-2 border-gray-200 rounded-md px-2 py-1">
                  {['food','travel','sightseeing','stay','other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input value={newActivity} onChange={(e)=>setNewActivity(e.target.value)} placeholder="Add activity" className="border-2 border-gray-200 rounded-md px-2 py-1 min-w-[180px]"/>
                <input value={newActivityTime} onChange={(e)=>setNewActivityTime(e.target.value)} className="border-2 border-gray-200 rounded-md px-2 py-1 w-24"/>
                <input value={newActivityNotes} onChange={(e)=>setNewActivityNotes(e.target.value)} placeholder="notes" className="border-2 border-gray-200 rounded-md px-2 py-1 min-w-[160px]"/>
                <button onClick={addActivity} className="px-3 py-1.5 bg-gray-900 text-white rounded-md">Add</button>
              </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="activities">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                    {activitiesForDay.map((a, idx) => (
                      <Draggable key={a.id} draggableId={a.id} index={idx}>
                        {(prov) => (
                          <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="border rounded-md px-3 py-2 bg-white flex items-start justify-between">
                            <div>
                              <ActivityCheckbox activity={a} tripId={trip._id} onUpdate={activities => setTrip(t => ({ ...t, activities }))} />
                              <div className="font-medium capitalize text-gray-900">{a.title}</div>
                              <div className="text-sm text-gray-600">{a.type} • {a.time}</div>
                              {a.notes && <div className="text-sm text-gray-600">{a.notes}</div>}
                            </div>
                            <div className={`h-2 w-2 rounded-full mt-2 ml-2 ${a.completed?'bg-green-600':'bg-gray-400'}`}/>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-medium text-gray-900">Expenses · Day {selectedDay}</h2>
              <div className="flex flex-wrap items-center gap-2 justify-end">
                <select value={newExpense.category} onChange={(e)=> setNewExpense(s=>({...s, category: e.target.value}))} className="border-2 border-gray-200 rounded-md px-2 py-1">
                  {['Flights','Lodging','Transport','Food','Activities','Other'].map(c=> <option key={c}>{c}</option>)}
                </select>
                {/* amount input is now manual and required */}
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e)=> setNewExpense(s=>({...s, amount: e.target.value}))}
                  className="border-2 border-gray-200 rounded-md px-2 py-1 w-28"
                  placeholder="Amount"
                  step="0.01"
                  min="0"
                />
                <button onClick={addExpense} className="px-3 py-1.5 bg-gray-900 text-white rounded-md">Add</button>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-2">Total Spent: ${(trip.expenses||[]).reduce((s,e)=>s+Number(e.amount||0),0).toFixed(2)}</div>

            <div className="grid grid-cols-2 gap-4">
              <div className="h-64">
                <Bar data={barData} options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }} />
              </div>
              <div className="h-64">
                <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom' } }, responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="mt-3">
              <div className="font-medium mb-1 text-gray-900">Expenses for this day</div>
              <div className="space-y-1 text-sm">
                {expensesForDay.map((e,i)=> (
                  <div key={i} className="flex items-center justify-between border rounded-md px-3 py-1 bg-white">
                    <div className="text-gray-800">{e.category}</div>
                    <div className="text-gray-600">${Number(e.amount).toFixed(2)}</div>
                  </div>
                ))}
                {!expensesForDay.length && <div className="text-gray-500">No expenses for this day.</div>}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
