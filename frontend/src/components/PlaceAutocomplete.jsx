import { useEffect, useState } from 'react'
import api from '../utils/api.js'

export default function PlaceAutocomplete({ value, onSelect, placeholder = 'Search city' }) {
  const [q, setQ] = useState(value || '')
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const id = setTimeout(async () => {
      if (!q) { setItems([]); return }
      const { data } = await api.get(`/places/autocomplete?q=${encodeURIComponent(q)}`)
      setItems(data.predictions || [])
    }, 250)
    return () => clearTimeout(id)
  }, [q])

  return (
    <div className="relative">
      <input value={q} onChange={(e)=>{ setQ(e.target.value); setOpen(true) }} onBlur={()=> setTimeout(()=>setOpen(false), 150)} placeholder={placeholder} className="w-full border rounded-md px-3 py-2"/>
      {open && !!items.length && (
        <div className="absolute z-10 mt-1 w-full card border rounded-md shadow">
          {items.map((p) => (
            <button type="button" key={p.place_id} onMouseDown={()=>{ onSelect(p); setQ(p.description); setOpen(false) }} className="w-full text-left px-3 py-2 hover:bg-gray-50">
              {p.description}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


