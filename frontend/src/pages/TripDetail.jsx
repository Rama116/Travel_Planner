import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import api from '../utils/api.js'
import { deleteTrip } from '../store/slices/tripsSlice.js'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

Chart.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)

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

    // derive date from selected day if trip has dates
    let date
    if (trip.tripStartDate) {
      const d = new Date(trip.tripStartDate)
      d.setDate(d.getDate() + (selectedDay - 1))
      date = d.toISOString()
    }

    const expense = { id: crypto.randomUUID(), category: newExpense.category, amount: amt, date }
    const { data } = await api.post(`/trips/${id}/expenses`, { expense })
    setTrip((t) => ({ ...t, expenses: data.expenses }))
    // reset amount to empty string (no implicit defaults)
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
    if (!trip?.tripStartDate) return (trip?.expenses || [])
    const dayStart = new Date(trip.tripStartDate)
    dayStart.setDate(dayStart.getDate() + (selectedDay - 1))
    const nextDay = new Date(dayStart)
    nextDay.setDate(nextDay.getDate() + 1)
    return (trip?.expenses || []).filter(e => e.date && new Date(e.date) >= dayStart && new Date(e.date) < nextDay)
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
                              <div className="font-medium capitalize text-gray-900">{a.title}</div>
                              <div className="text-sm text-gray-600">{a.type} • {a.time}</div>
                              {a.notes && <div className="text-sm text-gray-600">{a.notes}</div>}
                            </div>
                            <div className={`h-2 w-2 rounded-full mt-2 ${a.type==='food'?'bg-red-500':a.type==='travel'?'bg-blue-500':a.type==='sightseeing'?'bg-yellow-500':a.type==='stay'?'bg-green-500':'bg-gray-400'}`}/>
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
