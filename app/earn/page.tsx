'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const TOTAL_SPOTS = 40

export default function EarnPage() {
  const [visible, setVisible] = useState(false)
  const [spotsUsed, setSpotsUsed] = useState(0)
  const [form, setForm] = useState({ name: '', email: '', wallet: '', whatList: '', location: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setTimeout(() => setVisible(true), 80)
    // Fetch enrolled count
    supabase
      .from('listing_rewards')
      .select('id', { count: 'exact' })
      .in('status', ['enrolled', 'approved', 'paid'])
      .then(({ count }) => { if (count) setSpotsUsed(count) })
  }, [])

  const spotsLeft = Math.max(0, TOTAL_SPOTS - spotsUsed)
  const pctFull = Math.min(100, (spotsUsed / TOTAL_SPOTS) * 100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.wallet || !form.whatList) {
      setError('Please fill in all fields')
      return
    }
    if (spotsLeft === 0) {
      setError('Sorry — all spots have been claimed.')
      return
    }
    setSubmitting(true)
    try {
      // Check wallet not already enrolled
      const { data: existing } = await supabase
        .from('listing_rewards')
        .select('id')
        .eq('wallet_address', form.wallet.trim())
        .single()
      if (existing) {
        setError('This wallet address has already enrolled.')
        setSubmitting(false)
        return
      }
      await supabase.from('listing_rewards').insert([{
        name: form.name.trim(),
        email: form.email.trim(),
        wallet_address: form.wallet.trim(),
        what_will_list: form.whatList.trim(),
        location: form.location.trim(),
        status: 'enrolled',
      }])
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0F; color: #fff; font-family: 'DM Sans', sans-serif; }
        .earn-page { min-height: 100vh; background: #0A0A0F; opacity: 0; transform: translateY(18px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .earn-page.on { opacity: 1; transform: translateY(0); }
        .earn-nav { position: sticky; top: 0; z-index: 100; background: rgba(10,10,15,0.88); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(42,42,58,0.7); padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
        .earn-section { max-width: 720px; margin: 0 auto; padding: 60px 24px; }
        .step-row { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 24px; }
        .step-num { width: 36px; height: 36px; border-radius: 50%; background: #F7931A; color: #0A0A0F; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rule-row { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 12px; }
        .earn-input { width: 100%; padding: 12px 16px; border-radius: 10px; background: #0A0A0F; border: 1px solid #2A2A3A; color: #fff; font-size: 0.95rem; outline: none; box-sizing: border-box; }
        .earn-input:focus { border-color: #F7931A; }
        .earn-btn { width: 100%; padding: 14px; border-radius: 12px; background: #F7931A; color: #0A0A0F; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1rem; border: none; cursor: pointer; transition: opacity 0.2s; }
        .earn-btn:hover { opacity: 0.88; }
        .earn-btn:disabled { background: #2A2A3A; color: #8B8B9E; cursor: not-allowed; }
        .divider { height: 1px; background: linear-gradient(to right, transparent, rgba(42,42,58,0.9), transparent); max-width: 720px; margin: 0 auto; }
      `}</style>

      <div className={`earn-page${visible ? ' on' : ''}`}>

        {/* NAV */}
        <nav className="earn-nav">
          <Link href="/" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#F7931A', textDecoration: 'none' }}>Bitrove</Link>
          <Link href="/" style={{ color: '#8B8B9E', fontSize: '0.88rem', textDecoration: 'none', fontWeight: 500 }}>← Back to Home</Link>
        </nav>

        {/* HERO */}
        <section style={{ textAlign: 'center', padding: '80px 24px 60px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 10%, rgba(247,147,26,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'inline-block', background: 'rgba(247,147,26,0.12)', border: '1px solid rgba(247,147,26,0.3)', color: '#F7931A', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: 20, marginBottom: 22 }}>
            {spotsLeft > 0 ? `${spotsLeft} spots remaining` : 'All spots claimed'}
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', color: '#fff', marginBottom: 20, maxWidth: 580, marginLeft: 'auto', marginRight: 'auto' }}>
            List on Bitrove. Earn <span style={{ color: '#00D4AA' }}>$5 USDT</span> in 7 Days.
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#8B8B9E', maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.7 }}>
            We need real listings from real people. You need crypto. Simple deal.
            List any genuine item, keep it active for 7 days, we send 5 USDT directly to your wallet.
          </p>

          {/* Spot counter bar */}
          <div style={{ maxWidth: 400, margin: '0 auto 40px', background: '#13131A', borderRadius: 12, padding: '16px 20px', border: '1px solid #2A2A3A' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.82rem', color: '#8B8B9E' }}>Spots claimed</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F7931A' }}>{spotsUsed} / {TOTAL_SPOTS}</span>
            </div>
            <div style={{ height: 8, background: '#0A0A0F', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pctFull}%`, background: 'linear-gradient(to right, #F7931A, #00D4AA)', borderRadius: 4, transition: 'width 0.5s ease' }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#8B8B9E', marginTop: 8, textAlign: 'center' }}>
              {spotsLeft > 0 ? `${spotsLeft} spots remaining — first come first served` : 'All spots have been claimed'}
            </p>
          </div>
        </section>

        <div className="divider" />

        {/* WHY WE ARE DOING THIS */}
        <section className="earn-section">
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#F7931A', marginBottom: 10 }}>From the Founder</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em' }}>Why We Are Doing This</h2>
          <div style={{ background: '#13131A', border: '1px solid #2A2A3A', borderRadius: 16, padding: '28px 28px', color: '#8B8B9E', lineHeight: 1.8, fontSize: '0.95rem' }}>
            <p style={{ marginBottom: 16 }}>
              My name is James. I built Bitrove — a peer to peer marketplace where every trade is protected by a smart contract. No KYC. No banks. No middlemen.
            </p>
            <p style={{ marginBottom: 16 }}>
              The technology works. The escrow is live on Polygon mainnet. The smart contract is verified on Polygonscan. Buyers are protected from the moment they pay until the moment they confirm receipt.
            </p>
            <p style={{ marginBottom: 16 }}>
              What I need now is simple — <strong style={{ color: '#fff' }}>real listings from real people.</strong> A marketplace without listings is just a website. I want to prove Bitrove works in the real world with real items and real trades.
            </p>
            <p>
              So I am putting 5 USDT on the line for every genuine listing. If you list something real and keep it active for 7 days — I will send 5 USDT directly to your wallet. No platform. No middleman. Wallet to wallet.
            </p>
          </div>
        </section>

        <div className="divider" />

        {/* HOW IT WORKS */}
        <section className="earn-section">
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#F7931A', marginBottom: 10 }}>Simple Process</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', marginBottom: 32, letterSpacing: '-0.02em' }}>How It Works</h2>

          <div className="step-row">
            <div className="step-num">1</div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', marginBottom: 6 }}>Enroll below</div>
              <div style={{ color: '#8B8B9E', fontSize: '0.9rem', lineHeight: 1.65 }}>Fill in your details and your wallet address. We verify each application manually — no bots, no bulk signups.</div>
            </div>
          </div>

          <div className="step-row">
            <div className="step-num">2</div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', marginBottom: 6 }}>Get your early access code and list your item</div>
              <div style={{ color: '#8B8B9E', fontSize: '0.9rem', lineHeight: 1.65 }}>You will receive an early access code to enter the marketplace. Create your listing — real item, real photos, real price. Takes about 2 minutes.</div>
            </div>
          </div>

          <div className="step-row">
            <div className="step-num">3</div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', marginBottom: 6 }}>Keep it live for 7 days</div>
              <div style={{ color: '#8B8B9E', fontSize: '0.9rem', lineHeight: 1.65 }}>Your listing must stay active and genuine for 7 days. James reviews each one personally. No stock photos, no fake items.</div>
            </div>
          </div>

          <div className="step-row">
            <div className="step-num">4</div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', marginBottom: 6 }}>Receive 5 USDT to your wallet</div>
              <div style={{ color: '#8B8B9E', fontSize: '0.9rem', lineHeight: 1.65 }}>After 7 days of a verified genuine listing — 5 USDT lands directly in your wallet. No platform fees. No middlemen. Wallet to wallet.</div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* RULES */}
        <section className="earn-section">
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#F7931A', marginBottom: 10 }}>Eligibility</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', marginBottom: 24, letterSpacing: '-0.02em' }}>What Makes a Valid Listing</h2>
          <div style={{ background: '#13131A', border: '1px solid #2A2A3A', borderRadius: 16, padding: '24px 24px' }}>
            {[
              ['✅', 'Real item you actually own and intend to sell'],
              ['✅', 'Real photos — no stock images, no screenshots'],
              ['✅', 'Honest description and fair price'],
              ['✅', 'Your location included — suburb, city, or country'],
              ['✅', 'Listing stays active for the full 7 days'],
              ['✅', 'One reward per wallet address'],
              ['✅', 'Open worldwide — physical or digital items welcome'],
              ['❌', 'Fake, duplicate, or placeholder listings'],
              ['❌', 'Stock photos or images not of the actual item'],
              ['❌', 'Prohibited items — illegal goods, weapons, adult content'],
            ].map(([icon, text]) => (
              <div key={text} className="rule-row">
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
                <span style={{ color: icon === '❌' ? '#ff4444' : '#8B8B9E', fontSize: '0.9rem', lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '14px 20px', background: 'rgba(247,147,26,0.06)', border: '1px solid rgba(247,147,26,0.2)', borderRadius: 10, fontSize: '0.85rem', color: '#8B8B9E', lineHeight: 1.6 }}>
            🔍 <strong style={{ color: '#fff' }}>James reviews every listing personally.</strong> If your listing does not meet the criteria the reward will not be paid and your spot may be forfeited. Quality over quantity.
          </div>
        </section>

        <div className="divider" />

        {/* ENROLLMENT FORM */}
        <section className="earn-section">
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#F7931A', marginBottom: 10 }}>Claim Your Spot</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>Enroll Now</h2>
          <p style={{ color: '#8B8B9E', fontSize: '0.95rem', marginBottom: 32, lineHeight: 1.7 }}>
            {spotsLeft > 0 ? `${spotsLeft} spots remaining. First come first served.` : 'All spots have been claimed for this round. Check back soon.'}
          </p>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: '#13131A', border: '1px solid rgba(0,212,170,0.3)', borderRadius: 16 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#fff', fontSize: '1.3rem', marginBottom: 12 }}>You are enrolled!</h3>
              <p style={{ color: '#8B8B9E', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 20 }}>
                James will review your application and send your early access code within 24 hours. Once you receive it — go list your item and keep it active for 7 days.
              </p>
              <Link href="/browse" style={{ display: 'inline-block', padding: '12px 28px', background: '#F7931A', color: '#0A0A0F', borderRadius: 10, fontFamily: "'Syne', sans-serif", fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
                Explore the Marketplace
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ color: '#8B8B9E', fontSize: '0.78rem', display: 'block', marginBottom: 6 }}>Your Name</label>
                <input className="earn-input" type="text" placeholder="James Banner" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ color: '#8B8B9E', fontSize: '0.78rem', display: 'block', marginBottom: 6 }}>Email Address</label>
                <input className="earn-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label style={{ color: '#8B8B9E', fontSize: '0.78rem', display: 'block', marginBottom: 6 }}>Your Crypto Wallet Address (USDT on Polygon)</label>
                <input className="earn-input" type="text" placeholder="0x..." value={form.wallet} onChange={e => setForm(p => ({ ...p, wallet: e.target.value }))} style={{ fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ color: '#8B8B9E', fontSize: '0.78rem', display: 'block', marginBottom: 6 }}>Your Location (City / Country)</label>
                <input className="earn-input" type="text" placeholder="Sydney, Australia" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div>
                <label style={{ color: '#8B8B9E', fontSize: '0.78rem', display: 'block', marginBottom: 6 }}>What will you list?</label>
                <textarea className="earn-input" placeholder="e.g. My old MacBook Pro, some vinyl records, a surfboard..." value={form.whatList} onChange={e => setForm(p => ({ ...p, whatList: e.target.value }))} rows={3} style={{ resize: 'none' }} />
              </div>
              {error && <p style={{ color: '#ff4444', fontSize: '0.85rem' }}>{error}</p>}
              <button type="submit" className="earn-btn" disabled={submitting || spotsLeft === 0}>
                {submitting ? 'Submitting...' : spotsLeft === 0 ? 'All Spots Claimed' : 'Claim My Spot — Earn 5 USDT'}
              </button>
              <p style={{ color: '#8B8B9E', fontSize: '0.75rem', textAlign: 'center', lineHeight: 1.6 }}>
                By enrolling you agree to list a genuine item within 48 hours of receiving your access code and keep it active for 7 days. One reward per wallet address.
              </p>
            </form>
          )}
        </section>

        <div className="divider" />

        {/* TRUST SECTION */}
        <section className="earn-section">
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: 20, letterSpacing: '-0.02em' }}>Why You Can Trust This</h2>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {[
              { icon: '⛓️', title: 'Live on Polygon', body: 'Smart contract verified on Polygonscan. Real blockchain. Real escrow.' },
              { icon: '🔍', title: 'Open Source', body: 'Contract code is public. Anyone can audit it. No hidden backdoors.' },
              { icon: '👤', title: 'Real Founder', body: 'James Banner. Wooli, NSW, Australia. Real person, real project.' },
              { icon: '💸', title: 'Wallet to Wallet', body: '5 USDT sent direct. No platform fees. No delays. Traceable on chain.' },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ background: '#13131A', border: '1px solid #2A2A3A', borderRadius: 12, padding: '18px 16px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{icon}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.88rem', marginBottom: 6 }}>{title}</div>
                <div style={{ color: '#8B8B9E', fontSize: '0.82rem', lineHeight: 1.6 }}>{body}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* FOOTER */}
        <div style={{ textAlign: 'center', padding: '32px 24px', color: '#8B8B9E', fontSize: '0.83rem' }}>
          <span style={{ color: '#F7931A' }}>Bitrove</span> — Buy. Sell. Get paid in crypto. 🚀 &nbsp;|&nbsp;{' '}
          <a href="mailto:gm@bitrove.io" style={{ color: '#8B8B9E', textDecoration: 'none' }}>gm@bitrove.io</a>
          &nbsp;|&nbsp;
          <Link href="/how-it-works" style={{ color: '#8B8B9E', textDecoration: 'none' }}>How It Works</Link>
        </div>

      </div>
    </>
  )
}
