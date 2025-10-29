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
    <div className="max-w-2xl mx-auto card rounded-2xl p-6 border bg-white/90 backdrop-blur">
      <h1 className="text-2xl font-semibold mb-1">Create Trip</h1>
      <p className="text-gray-600 mb-4">Add destinations via smart autocomplete and set your plan.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600">Title</label>
          <input 
            value={title} 
            onChange={(e)=>setTitle(e.target.value)} 
            className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
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
              className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Trip End</label>
            <input 
              type="date"
              value={tripEndDate}
              onChange={(e)=> setTripEndDate(e.target.value)}
              min={tripStartDate || undefined}
              className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Add Destination</label>
          <PlaceAutocomplete onSelect={addPlace} />
        </div>
        <div className="space-y-3">
          {destinations.map((d, i) => (
            <div key={i} className="border rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-gray-900">{d.name}</div>
                <button 
                  type="button" 
                  onClick={()=> setDestinations(destinations.filter((_, idx)=> idx!==i))} 
                  className="text-gray-600 hover:text-gray-900 text-sm"
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
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-300 outline-none"
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
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-300 outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button 
          type="submit"
          disabled={!title.trim() || invalidTripDates}
          className="w-full bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Trip
        </button>
      </form>
    </div>
  )
}


