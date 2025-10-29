import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import PlaceAutocomplete from '../components/PlaceAutocomplete.jsx'
import { createTrip } from '../store/slices/tripsSlice.js'

export default function TripCreate() {
  const [title, setTitle] = useState('')
  const [tripStartDate, setTripStartDate] = useState('')
  const [tripEndDate, setTripEndDate] = useState('')
  const [destinations, setDestinations] = useState([])
  const dispatch = useDispatch()
  const navigate = useNavigate()

  function addPlace(p) {
    const fallbackStart = tripStartDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const fallbackEnd = tripEndDate || new Date(Date.now() + 7*86400000).toISOString().split('T')[0]
    setDestinations((d) => [
      ...d,
      { 
        name: p.description, 
        placeId: p.place_id, 
        startDate: fallbackStart, 
        endDate: fallbackEnd
      }
    ])
  }

  function updateDestinationDate(index, field, value) {
    setDestinations((d) => {
      const updated = [...d]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    if (tripStartDate && tripEndDate && new Date(tripEndDate) < new Date(tripStartDate)) {
      alert('Trip end date cannot be before start date')
      return
    }
    
    const formattedDestinations = destinations.map(d => ({
      ...d,
      startDate: new Date(d.startDate).toISOString(),
      endDate: new Date(d.endDate).toISOString()
    }))
    const payload = { 
      title, 
      destinations: formattedDestinations,
      tripStartDate: tripStartDate ? new Date(tripStartDate).toISOString() : undefined,
      tripEndDate: tripEndDate ? new Date(tripEndDate).toISOString() : undefined,
    }
    const res = await dispatch(createTrip(payload)).unwrap()
    navigate(`/trips/${res._id}`)
  }

  const invalidTripDates = tripStartDate && tripEndDate && new Date(tripEndDate) < new Date(tripStartDate)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* decorative blobs */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-gray-900 opacity-5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gray-900 opacity-5 rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur p-6">
          <h1 className="text-2xl font-semibold mb-1 text-gray-900">Plan a new trip</h1>
          <p className="text-gray-600">Give your trip a name, choose dates, then add destinations.</p>
        </div>

        <form onSubmit={onSubmit} className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-medium text-gray-900">Trip details</h2>
                {invalidTripDates && <span className="text-sm text-red-600">End date can’t be before start</span>}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600">Title</label>
                  <input 
                    value={title} 
                    onChange={(e)=>setTitle(e.target.value)} 
                    className="mt-1 w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-gray-900 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                    placeholder="e.g., Summer Europe Trip"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600">Trip Start</label>
                    <input 
                      type="date"
                      value={tripStartDate}
                      onChange={(e)=> setTripStartDate(e.target.value)}
                      className="mt-1 w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-gray-900 focus:outline-none transition-colors bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Trip End</label>
                    <input 
                      type="date"
                      value={tripEndDate}
                      onChange={(e)=> setTripEndDate(e.target.value)}
                      min={tripStartDate || undefined}
                      className="mt-1 w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-gray-900 focus:outline-none transition-colors bg-gray-50"
                    />
                  </div>
                </div>

                {(tripStartDate || tripEndDate) && (
                  <div className="text-sm text-gray-600">Duration preview: <span className="font-medium text-gray-900">{tripStartDate || '—'}</span> → <span className="font-medium text-gray-900">{tripEndDate || '—'}</span></div>
                )}
              </div>
            </section>

            <section className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-medium text-gray-900">Destinations</h2>
                <span className="text-sm text-gray-500">Optional • Add multiple</span>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Search city</label>
                <PlaceAutocomplete onSelect={addPlace} />
              </div>

              <div className="grid gap-3">
                {destinations.map((d, i) => (
                  <div key={i} className="border-2 border-gray-200 rounded-xl p-4 bg-white hover:shadow-sm transition">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium text-gray-900">{d.name}</div>
                      <button 
                        type="button" 
                        onClick={()=> setDestinations(destinations.filter((_, idx)=> idx!==i))} 
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                        <input 
                          type="date" 
                          value={d.startDate} 
                          onChange={(e)=> updateDestinationDate(i, 'startDate', e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-md px-3 py-2 text-sm focus:border-gray-900 focus:outline-none transition-colors bg-gray-50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">End Date</label>
                        <input 
                          type="date" 
                          value={d.endDate} 
                          onChange={(e)=> updateDestinationDate(i, 'endDate', e.target.value)}
                          min={d.startDate}
                          className="w-full border-2 border-gray-200 rounded-md px-3 py-2 text-sm focus:border-gray-900 focus:outline-none transition-colors bg-gray-50"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {!destinations.length && (
                  <div className="text-sm text-gray-600">No destinations yet. Add one above to get started.</div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="font-medium text-gray-900 mb-2">Summary</div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Title: <span className="font-medium text-gray-900">{title || '—'}</span></li>
                <li>Trip dates: <span className="font-medium text-gray-900">{tripStartDate || '—'} → {tripEndDate || '—'}</span></li>
                <li>Destinations: <span className="font-medium text-gray-900">{destinations.length}</span></li>
              </ul>
            </div>

            <button 
              type="submit"
              disabled={!title.trim() || invalidTripDates}
              className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Create Trip
            </button>
          </aside>
        </form>
      </div>
    </div>
  )
}
