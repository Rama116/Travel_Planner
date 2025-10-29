import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api.js'

export const fetchTrips = createAsyncThunk('trips/fetchTrips', async () => {
  const { data } = await api.get('/trips')
  return data.trips
})

export const createTrip = createAsyncThunk('trips/createTrip', async (payload) => {
  const { data } = await api.post('/trips', payload)
  return data.trip
})

export const deleteTrip = createAsyncThunk('trips/deleteTrip', async (tripId) => {
  await api.delete(`/trips/${tripId}`)
  return tripId
})

const slice = createSlice({
  name: 'trips',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.items = action.payload
        state.status = 'succeeded'
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t._id !== action.payload)
      })
  }
})

export default slice.reducer


