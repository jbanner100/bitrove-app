// ── BITROVE SELL PAGE (app/sell/page.tsx) ─────────────────────
'use client'

import PhotoUpload from '../components/PhotoUpload'
import { supabase } from '../../lib/supabase'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { CATEGORIES, MAIN_CATEGORIES } from '../../lib/categories'

const conditions = ['New', 'Like New', 'Good', 'Fair']
const tokens = ['BTC', 'ETH', 'USDT']

export default function SellPage() {
  const { address, isConnected } = useAccount()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
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
  })

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const isStep1Valid = form.title && form.category && form.subcategory && form.condition && form.location
  const isStep2Valid = form.audPrice && form.token
  const isStep3Valid = form.description

  const publishListing = async () => {
    if (!address) return
    setLoading(true)
    const { error } = await supabase
      .from('listings')
      .insert([{
        title: form.title,
        description: form.description,
        category: form.category,
        subcategory: form.subcategory,
        condition: form.condition,
        location: form.location,
        aud_price: parseFloat(form.audPrice),
        token: form.token,
        seller_address: address,
        status: 'active',
        photos: photos
      }])
      .select()

    setLoading(false)
    if (error) {
      alert('Error creating listing: ' + error.message)
    } else {
      alert('Listing published successfully!')
      window.location.href = '/'
    }
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0A0A0F' }}>

      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#2A2A3A' }}>
        <div className="flex items-center gap-8">
          <a href="/" className="text-xl font-bold" style={{ color: '#F7931A' }}>Bitrove</a>
        </div>
        <ConnectButton accountStatus="avatar" chainStatus="none" showBalance={false} />
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-white mb-2">List an Item</h1>
        <p className="mb-8" style={{ color: '#8B8B9E' }}>Your wallet is your account. No registration needed.</p>

        {!isConnected && (
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
            <p className="text-white font-semibold mb-4">Connect your wallet to start listing</p>
            <p className="text-sm mb-6" style={{ color: '#8B8B9E' }}>Your wallet address is your seller identity on Bitrove. No email or password needed.</p>
            <ConnectButton />
          </div>
        )}

        {isConnected && (
          <div>
            <div className="rounded-lg px-4 py-3 mb-8 flex items-center gap-3" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
              <span style={{ color: '#00D4AA' }}>✓</span>
              <div>
                <p className="text-xs" style={{ color: '#8B8B9E' }}>Selling as</p>
                <p className="font-mono text-sm text-white">{address}</p>
              </div>
            </div>

            <div className="flex gap-2 mb-8">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex-1 h-1 rounded-full" style={{ backgroundColor: step >= s ? '#F7931A' : '#2A2A3A' }} />
              ))}
            </div>

            {step === 1 && (
              <div className="rounded-xl p-6" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
                <h2 className="text-white font-semibold mb-6">Step 1 — Item Details</h2>

                <div className="mb-4">
                  <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>Item Title</label>
                  <input type="text" placeholder="e.g. MacBook Pro 2023 M2" value={form.title} onChange={e => updateForm('title', e.target.value)} className="w-full px-4 py-3 rounded-lg text-white outline-none" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }} />
                </div>

                <div className="mb-4">
                  <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>Category</label>
                  <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {MAIN_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { updateForm('category', cat); updateForm('subcategory', '') }}
                        className="px-3 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0"
                        style={{ backgroundColor: form.category === cat ? '#F7931A' : '#0A0A0F', border: `1px solid ${form.category === cat ? '#F7931A' : '#2A2A3A'}`, color: form.category === cat ? '#fff' : '#8B8B9E' }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  {form.category && CATEGORIES[form.category] && (
                    <div className="mt-2">
                      <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>Sub-category</label>
                      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {CATEGORIES[form.category].map(sub => (
                          <button
                            key={sub}
                            onClick={() => updateForm('subcategory', sub)}
                            className="px-3 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0"
                            style={{ backgroundColor: form.subcategory === sub ? '#00D4AA' : '#0A0A0F', border: `1px solid ${form.subcategory === sub ? '#00D4AA' : '#2A2A3A'}`, color: form.subcategory === sub ? '#fff' : '#8B8B9E' }}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>Condition</label>
                  <div className="flex gap-2 flex-wrap">
                    {conditions.map(cond => (
                      <button key={cond} onClick={() => updateForm('condition', cond)} className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: form.condition === cond ? '#F7931A' : '#0A0A0F', border: `1px solid ${form.condition === cond ? '#F7931A' : '#2A2A3A'}`, color: form.condition === cond ? '#fff' : '#8B8B9E' }}>{cond}</button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>Location (suburb/city only)</label>
                  <input type="text" placeholder="e.g. Sydney, NSW" value={form.location} onChange={e => updateForm('location', e.target.value)} className="w-full px-4 py-3 rounded-lg text-white outline-none" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }} />
                </div>

                <button onClick={() => setStep(2)} disabled={!isStep1Valid} className="w-full py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: isStep1Valid ? '#F7931A' : '#2A2A3A' }}>Next — Set Price</button>
              </div>
            )}

            {step === 2 && (
              <div className="rounded-xl p-6" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
                <h2 className="text-white font-semibold mb-6">Step 2 — Pricing</h2>

                <div className="mb-4">
                  <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>Asking Price (AUD)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-white">$</span>
                    <input type="number" placeholder="0.00" value={form.audPrice} onChange={e => updateForm('audPrice', e.target.value)} className="flex-1 px-4 py-3 rounded-lg text-white outline-none" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }} />
                    <span style={{ color: '#8B8B9E' }}>AUD</span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>I want to be paid in</label>
                  <div className="flex gap-3">
                    {tokens.map(token => (
                      <button key={token} onClick={() => updateForm('token', token)} className="flex-1 py-3 rounded-lg font-semibold" style={{ backgroundColor: form.token === token ? '#F7931A' : '#0A0A0F', border: `1px solid ${form.token === token ? '#F7931A' : '#2A2A3A'}`, color: form.token === token ? '#fff' : '#8B8B9E' }}>
                        {token === 'BTC' ? '₿' : token === 'ETH' ? 'Ξ' : '◈'} {token}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-lg font-semibold" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A', color: '#8B8B9E' }}>Back</button>
                  <button onClick={() => setStep(3)} disabled={!isStep2Valid} className="flex-1 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: isStep2Valid ? '#F7931A' : '#2A2A3A' }}>Next — Description</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="rounded-xl p-6" style={{ backgroundColor: '#13131A', border: '1px solid #2A2A3A' }}>
                <h2 className="text-white font-semibold mb-6">Step 3 — Description & Photos</h2>

                <div className="mb-4">
                  <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>Description</label>
                  <textarea placeholder="Describe your item..." value={form.description} onChange={e => updateForm('description', e.target.value)} className="w-full px-4 py-3 rounded-lg text-white outline-none resize-none" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }} rows={5} />
                </div>

                <div className="mb-6">
                  <PhotoUpload onPhotosChange={(urls) => setPhotos(urls)} />
                </div>

                <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A' }}>
                  <p className="text-xs font-semibold text-white mb-3">Listing Summary</p>
                  <div className="flex justify-between mb-1"><span className="text-xs" style={{ color: '#8B8B9E' }}>Title</span><span className="text-xs text-white">{form.title}</span></div>
                  <div className="flex justify-between mb-1"><span className="text-xs" style={{ color: '#8B8B9E' }}>Category</span><span className="text-xs text-white">{form.category} → {form.subcategory}</span></div>
                  <div className="flex justify-between mb-1"><span className="text-xs" style={{ color: '#8B8B9E' }}>Condition</span><span className="text-xs text-white">{form.condition}</span></div>
                  <div className="flex justify-between mb-1"><span className="text-xs" style={{ color: '#8B8B9E' }}>Location</span><span className="text-xs text-white">{form.location}</span></div>
                  <div className="flex justify-between mb-1"><span className="text-xs" style={{ color: '#8B8B9E' }}>Price</span><span className="text-xs" style={{ color: '#F7931A' }}>${form.audPrice} AUD in {form.token}</span></div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-lg font-semibold" style={{ backgroundColor: '#0A0A0F', border: '1px solid #2A2A3A', color: '#8B8B9E' }}>Back</button>
                  <button onClick={publishListing} disabled={!isStep3Valid || loading} className="flex-1 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: isStep3Valid ? '#F7931A' : '#2A2A3A' }}>
                    {loading ? 'Publishing...' : 'Publish Listing'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
