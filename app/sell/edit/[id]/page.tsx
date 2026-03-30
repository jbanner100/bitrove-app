// ── BITROVE EDIT LISTING PAGE (app/sell/edit/[id]/page.tsx) ───
'use client'

import PhotoUpload from '../../../components/PhotoUpload'
import { supabase } from '../../../../lib/supabase'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useParams } from 'next/navigation'
import { CATEGORIES, MAIN_CATEGORIES } from '../../../../lib/categories'

const conditions = ['New', 'Like New', 'Good', 'Fair']
const tokens = ['USDT', 'WETH', 'WBTC']

export default function EditListingPage() {
  const { address, isConnected } = useAccount()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [photos, setPhotos] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    condition: '',
    location: '',
    audPrice: '',
    token: '',
    quantity: '1',
    deliveryType: 'postage',
    postageCost: '0',
  })

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    const fetchListing = async () => {
      const { data } = await supabase.from('listings').select('*').eq('id', id).single()
      if (data) {
        setForm({
          title: data.title || '',
          description: data.description || '',
          category: data.category || '',
          subcategory: data.subcategory || '',
          condition: data.condition || '',
          location: data.location || '',
          audPrice: data.aud_price?.toString() || '',
          token: data.token || '',
          quantity: data.quantity?.toString() || '1',
          deliveryType: data.delivery_type || 'postage',
          postageCost: data.postage_cost?.toString() || '0',
        })
        setPhotos(data.photos || [])
      }
      setFetching(false)
    }
    if (id) fetchListing()
  }, [id])

  const isValid = form.title && form.category && form.subcategory && form.condition && form.location && form.audPrice && form.token

  const updateListing = async () => {
    if (!address) return
    setLoading(true)
    const { error } = await supabase
      .from('listings')
      .update({
        title: form.title,
        description: form.description,
        category: form.category,
        subcategory: form.subcategory,
        condition: form.condition,
        location: form.location,
        aud_price: parseFloat(form.audPrice),
        token: form.token,
        quantity: parseInt(form.quantity),
        delivery_type: form.deliveryType,
        postage_cost: parseFloat(form.postageCost) || 0,
        photos: photos,
      })
      .eq('id', id)
      .eq('seller_address', address)
    setLoading(false)
    if (error) {
      alert('Error updating listing: ' + error.message)
    } else {
      alert('Listing updated!')
      window.location.href = '/trades'
    }
  }

  if (fetching) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0F' }}>
      <p style={{ color: '#8B8B9E' }}>Loading...</p>
    </main>
  )

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0A0A0F' }}>
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#2A2A3A' }}>
        <div className="flex items-center gap-4">
          <a href="/browse" className="text-xl font-bold" style={{ color: '#F7931A' }}>Bitrove</a>
          <a href="/trades" className="text-sm" style={{ color: '#8B8B9E' }}>← Back to My Trades</a>
        </div>
        <ConnectButton accountStatus="avatar" chainStatus="none" showBalance={false} />
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-white mb-2">Edit Listing</h1>
        <p className="mb-8" style={{ color: '#8B8B9E' }}>Update your listing details below.</p>

        {!isConnected ? (
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
            <p className="text-white font-semibold mb-4">Connect your wallet to edit listings</p>
            <ConnectButton />
          </div>
        ) : (
          <div className="rounded-xl p-6" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>

            <div className="mb-4">
              <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>Item Title</label>
              <input type="text" value={form.title} onChange={e => updateForm('title', e.target.value)} className="w-full px-4 py-3 rounded-lg text-white outline-none" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }} />
            </div>

            <div className="mb-4">
              <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>Category</label>
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {MAIN_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => { updateForm('category', cat); updateForm('subcategory', '') }}
                    className="px-3 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0"
                    style={{ backgroundColor: form.category === cat ? '#F7931A' : '#0A0A0F', border: `1px solid ${form.category === cat ? '#F7931A' : '#2A2A3A'}`, color: form.category === cat ? '#fff' : '#8B8B9E' }}>
                    {cat}
                  </button>
                ))}
              </div>
              {form.category && CATEGORIES[form.category] && (
                <div className="flex gap-2 overflow-x-auto pb-2 mt-2" style={{ scrollbarWidth: 'none' }}>
                  {CATEGORIES[form.category].map(sub => (
                    <button key={sub} onClick={() => updateForm('subcategory', sub)}
                      className="px-3 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0"
                      style={{ backgroundColor: form.subcategory === sub ? '#00D4AA' : '#0A0A0F', border: `1px solid ${form.subcategory === sub ? '#00D4AA' : '#2A2A3A'}`, color: form.subcategory === sub ? '#fff' : '#8B8B9E' }}>
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>Condition</label>
              <div className="flex gap-2 flex-wrap">
                {conditions.map(cond => (
                  <button key={cond} onClick={() => updateForm('condition', cond)}
                    className="px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: form.condition === cond ? '#F7931A' : '#0A0A0F', border: `1px solid ${form.condition === cond ? '#F7931A' : '#2A2A3A'}`, color: form.condition === cond ? '#fff' : '#8B8B9E' }}>
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>Location</label>
              <input type="text" value={form.location} onChange={e => updateForm('location', e.target.value)} className="w-full px-4 py-3 rounded-lg text-white outline-none" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }} />
            </div>

            <div className="mb-4">
              <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>Price (AUD)</label>
              <div className="flex items-center gap-2">
                <span className="text-white">$</span>
                <input type="number" value={form.audPrice} onChange={e => updateForm('audPrice', e.target.value)} className="flex-1 px-4 py-3 rounded-lg text-white outline-none" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }} />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>Token</label>
              <div className="flex gap-3">
                {tokens.map(token => (
                  <button key={token} onClick={() => updateForm('token', token)} className="flex-1 py-3 rounded-lg font-semibold"
                    style={{ backgroundColor: form.token === token ? '#F7931A' : '#0A0A0F', border: `1px solid ${form.token === token ? '#F7931A' : '#2A2A3A'}`, color: form.token === token ? '#fff' : '#8B8B9E' }}>
                    {token}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={e => updateForm('quantity', e.target.value)} className="w-full px-4 py-3 rounded-lg text-white outline-none" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }} />
            </div>

            <div className="mb-4">
              <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>Delivery Method</label>
              <div className="flex gap-2 mb-2">
                <button onClick={() => updateForm('deliveryType', 'postage')} className="flex-1 py-3 rounded-lg text-sm font-semibold"
                  style={{ backgroundColor: form.deliveryType === 'postage' ? '#F7931A' : '#0A0A0F', border: `1px solid ${form.deliveryType === 'postage' ? '#F7931A' : '#2A2A3A'}`, color: form.deliveryType === 'postage' ? '#fff' : '#8B8B9E' }}>
                  📦 Postage
                </button>
                <button onClick={() => updateForm('deliveryType', 'collection')} className="flex-1 py-3 rounded-lg text-sm font-semibold"
                  style={{ backgroundColor: form.deliveryType === 'collection' ? '#F7931A' : '#0A0A0F', border: `1px solid ${form.deliveryType === 'collection' ? '#F7931A' : '#2A2A3A'}`, color: form.deliveryType === 'collection' ? '#fff' : '#8B8B9E' }}>
                  🤝 Collection Only
                </button>
              </div>
              {form.deliveryType === 'postage' && (
                <div className="flex items-center gap-2">
                  <span className="text-white">$</span>
                  <input type="number" min="0" placeholder="0.00" value={form.postageCost} onChange={e => updateForm('postageCost', e.target.value)} className="flex-1 px-4 py-3 rounded-lg text-white outline-none" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }} />
                  <span style={{ color: '#8B8B9E' }}>AUD postage</span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>Description</label>
              <textarea value={form.description} onChange={e => updateForm('description', e.target.value)} rows={4} className="w-full px-4 py-3 rounded-lg text-white outline-none resize-none" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }} />
            </div>

            <div className="mb-6">
              <PhotoUpload onPhotosChange={(urls) => setPhotos(urls)} existingPhotos={photos} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => window.location.href = '/trades'} className="flex-1 py-3 rounded-lg font-semibold" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A', color: '#8B8B9E' }}>Cancel</button>
              <button onClick={updateListing} disabled={!isValid || loading} className="flex-1 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: isValid ? '#F7931A' : '#2A2A3A' }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
