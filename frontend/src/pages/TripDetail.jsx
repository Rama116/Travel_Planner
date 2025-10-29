import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import api from '../utils/api.js'
import { deleteTrip } from '../store/slices/tripsSlice.js'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Bar } from 'react-chartjs-2'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [trip, setTrip] = useState(null)
  const [newActivity, setNewActivity] = useState('')
  const [newExpense, setNewExpense] = useState({ category: 'Food', amount: 0 })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    api.get(`/trips/${id}`).then(({ data }) => setTrip(data.trip))
  }, [id])

  async function addActivity() {
    if (!newActivity.trim()) return
    const activity = { id: crypto.randomUUID(), title: newActivity, day: 1, time: '10:00' }
    const { data } = await api.post(`/trips/${id}/activities`, { activity })
    setTrip((t) => ({ ...t, activities: data.activities }))
    setNewActivity('')
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
    const expense = { id: crypto.randomUUID(), category: newExpense.category, amount: Number(newExpense.amount) }
    const { data } = await api.post(`/trips/${id}/expenses`, { expense })
    setTrip((t) => ({ ...t, expenses: data.expenses }))
    setNewExpense({ category: 'Food', amount: 0 })
  }

  async function handleDelete() {
    try {
      await dispatch(deleteTrip(id)).unwrap()
      navigate('/dashboard')
    } catch (err) {
      alert('Failed to delete trip')
    }
  }

  const chartData = useMemo(() => {
    const sums = (trip?.expenses || []).reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})
    const labels = Object.keys(sums)
    const values = Object.values(sums)
    return { labels, datasets: [{ label: 'Expenses', data: values, backgroundColor: '#111827' }] }
  }, [trip])

  if (!trip) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border card bg-gradient-to-br from-white to-gray-50 p-6">
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

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card border rounded-2xl p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">Itinerary</h2>
            <div className="flex gap-2">
              <input value={newActivity} onChange={(e)=>setNewActivity(e.target.value)} placeholder="Add activity" className="border rounded-md px-2 py-1"/>
              <button onClick={addActivity} className="px-3 py-1.5 bg-gray-900 text-white rounded-md">Add</button>
            </div>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="activities">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {trip.activities.map((a, idx) => (
                    <Draggable key={a.id} draggableId={a.id} index={idx}>
                      {(prov) => (
                        <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="border rounded-md px-3 py-2 bg-white">
                          <div className="font-medium">{a.title}</div>
                          <div className="text-sm text-gray-600">Day {a.day} • {a.time}</div>
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

        <div className="card border rounded-2xl p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">Budget</h2>
            <div className="flex items-center gap-2">
              <select value={newExpense.category} onChange={(e)=> setNewExpense(s=>({...s, category: e.target.value}))} className="border rounded-md px-2 py-1">
                {['Flights','Lodging','Transport','Food','Activities','Other'].map(c=> <option key={c}>{c}</option>)}
              </select>
              <input type="number" value={newExpense.amount} onChange={(e)=> setNewExpense(s=>({...s, amount: e.target.value}))} className="border rounded-md px-2 py-1 w-24"/>
              <button onClick={addExpense} className="px-3 py-1.5 bg-gray-900 text-white rounded-md">Add</button>
            </div>
          </div>
          <div className="h-64">
            <Bar data={chartData} options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  )
}
