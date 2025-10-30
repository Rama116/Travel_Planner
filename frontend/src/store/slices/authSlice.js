import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api.js'

const tokenFromStorage = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

export const login = createAsyncThunk('auth/login', async (payload) => {
  const { data } = await api.post('/auth/login', payload)
  return data
})

export const signup = createAsyncThunk('auth/signup', async (payload) => {
  const { data } = await api.post('/auth/register', payload)
  return data
})

export const slice = createSlice({
  name: 'auth',
  initialState: { user: null, token: tokenFromStorage, status: 'idle', error: null },
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      if (typeof localStorage !== 'undefined') localStorage.removeItem('token')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        if (typeof localStorage !== 'undefined') localStorage.setItem('token', action.payload.token)
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        if (typeof localStorage !== 'undefined') localStorage.setItem('token', action.payload.token)
      })
  },
})

export const { logout } = slice.actions
export default slice.reducer


