
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { store } from './store/store.js'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import TripCreate from './pages/TripCreate.jsx'
import TripDetail from './pages/TripDetail.jsx'
import Profile from './pages/Profile.jsx'
import Home from './pages/Home.jsx'
import api from './utils/api.js';
import { logout } from './store/slices/authSlice';

function Shell() {
  const dispatch = useDispatch();
  const token = useSelector(s => s.auth.token);
  const user = useSelector(s => s.auth.user);
  useEffect(() => {
    async function fetchMe() {
      if (token && !user) {
        try {
          const { data } = await api.get('/auth/me');
          if (data.user) dispatch({ type:'auth/login/fulfilled', payload:{ token, user:data.user } })
          else dispatch(logout());
        } catch (err) {
          dispatch(logout());
        }
      }
    }
    fetchMe();
  }, [token, user, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}> 
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/trips/new" element={<ProtectedRoute><TripCreate /></ProtectedRoute>} />
          <Route path="/trips/:id" element={<ProtectedRoute><TripDetail /></ProtectedRoute>} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <Provider store={store}>
      <Shell />
    </Provider>
  )
}

export default App
