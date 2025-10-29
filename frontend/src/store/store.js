import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice.js'
import tripsReducer from './slices/tripsSlice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trips: tripsReducer,
  },
})


