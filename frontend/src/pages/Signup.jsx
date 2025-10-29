import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '../store/slices/authSlice.js'

export default function Signup() {
  const [name, setName] = useState('Demo User')
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    try {
      await dispatch(signup({ name, email, password })).unwrap()
      navigate('/dashboard')
    } catch (e) {
      setError('Signup failed')
    }
  }

  return (
    <div className="max-w-md mx-auto card shadow-sm rounded-xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Create your account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600">Name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2"/>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Email</label>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className="mt-1 w-full border rounded-md px-3 py-2"/>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Password</label>
          <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" className="mt-1 w-full border rounded-md px-3 py-2"/>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full bg-gray-900 text-white py-2 rounded-md">Sign Up</button>
      </form>
      <p className="text-sm text-gray-600 mt-4">Have an account? <Link to="/login" className="text-gray-900">Log in</Link></p>
    </div>
  )
}


