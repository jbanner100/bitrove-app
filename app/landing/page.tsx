// ── BITROVE LANDING PAGE (app/landing/page.tsx) ─────────────────
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase } from '../../lib/supabase'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeCard, setActiveCard] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [modalEmail, setModalEmail] = useState('')
  const [modalSubmitted, setModalSubmitted] = useState(false)
  const [modalSubmitting, setModalSubmitting] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    try {
      await supabase.from('waitlist').insert([{ email: email.trim() }])
    } catch (err) {}
    setSubmitted(true)
    setSubmitting(false)
  }

  const handleMarketplaceClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowModal(true)
  }

  const handleModalWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalEmail.trim()) return
    setModalSubmitting(true)
    try {
      await supabase.from('waitlist').insert([{ email: modalEmail.trim() }])
    } catch (err) {}
    setModalSubmitted(true)
    setModalSubmitting(false)
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const steps = [
    {
      number: '01',
      title: 'List your item',
      subtitle: 'Add your physical product to the marketplace in just a few taps.',
      detail: 'Connect your wallet, set your price in AUD, choose your preferred crypto (BTC, ETH, or USDT), upload photos, and go live. No registration. No email. Your wallet is your identity.',
      image: '/images/list item 2.png',
      color: '#F7931A',
    },
    {
      number: '02',
      title: 'Buyer pays in crypto',
      subtitle: 'Accept payments directly in your wallet. No banks, no delays.',
      detail: 'Buyers watch the live crypto price and time their purchase. When they hit Buy Now, funds are locked in a smart contract escrow on Polygon. Use the secure encrypted chat to ask the seller any questions before committing. 2% Bitrove fee applies.',
      image: '/images/wallet.png',
      color: '#00D4AA',
    },
    {
      number: '03',
      title: 'Funds released on delivery',
      subtitle: 'Bitrove escrow releases payment once delivery is confirmed.',
      detail: 'Once the buyer receives their item — by delivery or collection — and confirms receipt, funds release automatically to your wallet. No middleman touches the money. Auto-release after 7 days if no action taken.',
      image: '/images/funds.png',
      color: '#F7931A',
    },
  ]

  const pillars = [
    { icon: '🛡️', title: 'No middleman', desc: 'Smart contract escrow handles everything. No third party holds your funds.' },
    { icon: '🔑', title: 'Self custody', desc: 'Your keys, your crypto. Funds go directly to your wallet on release.' },
    { icon: '⛓️', title: 'Built on blockchain', desc: 'Every trade is recorded on Polygon. Transparent, immutable, auditable.' },
    { icon: '🔒', title: 'Private & Secure', desc: 'Wallet-as-identity. No email, no password, no personal data stored.' },
  ]

  return (
    <main style={{ backgroundColor: '#0A0A0F', color: '#fff', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
        @keyframes fade-up { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(247,147,26,0.3)} 50%{box-shadow:0 0 40px rgba(247,147,26,0.6)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .float{animation:float 4s ease-in-out infinite}
        .fade-up{animation:fade-up 0.8s ease both}
        .fade-up-1{animation:fade-up 0.8s ease 0.1s both}
        .fade-up-2{animation:fade-up 0.8s ease 0.2s both}
        .fade-up-3{animation:fade-up 0.8s ease 0.3s both}
        .fade-up-4{animation:fade-up 0.8s ease 0.4s both}
        .btn-primary{background:linear-gradient(135deg,#F7931A,#e8820a);color:#fff;border:none;cursor:pointer;font-weight:700;transition:all 0.2s;animation:glow 3s ease-in-out infinite}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(247,147,26,0.5)}
        .nav-link{color:#8B8B9E;font-size:14px;font-weight:500;cursor:pointer;transition:color 0.2s}
        .nav-link:hover{color:#fff}
        .step-card{cursor:pointer;transition:all 0.3s;border:1px solid #2A2A3A;background:#13131A;border-radius:20px;overflow:hidden}
        .step-card:hover{border-color:#F7931A;transform:translateY(-4px)}
        .step-card.active{border-color:#F7931A;box-shadow:0 0 30px rgba(247,147,26,0.15)}
        .pillar-card{transition:all 0.3s;border:1px solid #2A2A3A;background:#13131A;border-radius:16px;padding:28px;text-align:center}
        .pillar-card:hover{border-color:#00D4AA;transform:translateY(-4px);box-shadow:0 0 30px rgba(0,212,170,0.1)}
        .shimmer-text{background:linear-gradient(90deg,#00D4AA,#F7931A,#00D4AA);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite}
        .step-detail{max-height:0;overflow:hidden;transition:max-height 0.4s ease,opacity 0.3s ease;opacity:0}
        .step-detail.open{max-height:200px;opacity:1}
        .mesh-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% -10%,rgba(247,147,26,0.08) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 80%,rgba(0,212,170,0.05) 0%,transparent 50%);pointer-events:none}
        input[type="email"]{background:#13131A;border:1px solid #2A2A3A;color:#fff;outline:none;transition:border-color 0.2s;font-family:inherit}
        input[type="email"]:focus{border-color:#F7931A}
        input[type="email"]::placeholder{color:#4A4A5A}
        @media(max-width:768px){
          .steps-grid{grid-template-columns:1fr !important}
          .pillars-grid{grid-template-columns:1fr 1fr !important}
          .hero-title{font-size:2.5rem !important}
          .nav-desktop{display:none !important}
          .stats-grid{grid-template-columns:1fr !important}
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: scrollY > 50 ? 'rgba(10,10,15,0.95)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(12px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid #1A1A2A' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#F7931A' }}>Bitrove</span>
          <span style={{ fontSize: 10, color: '#F7931A', opacity: 0.7 }}>®</span>
        </div>
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <span className="nav-link" onClick={() => scrollTo('how-it-works')}>How it Works</span>
          <span className="nav-link" onClick={() => scrollTo('why-bitrove')}>Why Bitrove</span>
          <span className="nav-link" onClick={() => scrollTo('waitlist')}>Join Waitlist</span>
          <button onClick={handleMarketplaceClick} style={{ color: '#F7931A', fontSize: 14, fontWeight: 600, padding: '8px 18px', border: '1px solid rgba(247,147,26,0.4)', borderRadius: 8, transition: 'all 0.2s', background: 'transparent', cursor: 'pointer' }}>
            Enter Marketplace →
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative', textAlign: 'center' }}>
        <div className="mesh-bg" />

        <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, border: '1px solid rgba(247,147,26,0.4)', background: 'rgba(247,147,26,0.1)', fontSize: 12, fontWeight: 600, color: '#F7931A', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 32 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#F7931A', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
          Live Soon — Join the Waitlist
        </div>

        <h1 className="hero-title fade-up-1" style={{ fontFamily: 'Syne, sans-serif', fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: 20, maxWidth: 900 }}>
          Buy. Sell.
          <span className="shimmer-text">Get paid in crypto.</span>
        </h1>

        <p className="fade-up-2" style={{ fontSize: 20, color: '#8B8B9E', marginBottom: 40, maxWidth: 540, lineHeight: 1.6 }}>
          The marketplace that rewards you for watching the market. No middleman. No banks. Just crypto.
        </p>

        <div className="fade-up-3" style={{ display: 'flex', gap: 16, marginBottom: 80, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => scrollTo('waitlist')} style={{ padding: '16px 36px', borderRadius: 100, fontSize: 16 }}>
            Join Waitlist
          </button>
          <button onClick={handleMarketplaceClick} style={{ padding: '16px 36px', borderRadius: 100, fontSize: 16, fontWeight: 600, color: '#fff', border: '1px solid #2A2A3A', backgroundColor: '#13131A', cursor: 'pointer' }}>
            Browse Marketplace
          </button>
        </div>

        <div className="float fade-up-4" style={{ position: 'relative', maxWidth: 340, width: '100%' }}>
          <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(ellipse,rgba(247,147,26,0.15) 0%,transparent 70%)', borderRadius: '50%' }} />
          <img src="/images/Hero image.png" alt="Bitrove marketplace" style={{ width: '100%', borderRadius: 28, position: 'relative', zIndex: 1, boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }} />
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" style={{ padding: '120px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ color: '#F7931A', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>How it Works</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>
            Three steps to <span className="shimmer-text">financial freedom</span>
          </h2>
          <p style={{ color: '#8B8B9E', fontSize: 18, maxWidth: 500, margin: '0 auto' }}>
            Sell anything. Get paid in crypto. No intermediaries.
          </p>
        </div>

        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {steps.map((step, i) => (
            <div key={i} className={`step-card ${activeCard === i ? 'active' : ''}`} onClick={() => setActiveCard(activeCard === i ? null : i)}>
              <div style={{ height: 280, overflow: 'hidden', position: 'relative' }}>
                <img src={step.image} alt={step.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', transform: activeCard === i ? 'scale(1.05)' : 'scale(1)' }} />
                <div style={{ position: 'absolute', top: 16, left: 16, fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, color: 'rgba(255,255,255,0.08)', lineHeight: 1 }}>{step.number}</div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(19,19,26,0.8) 0%,transparent 50%)' }} />
              </div>
              <div style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 8, color: step.color }}>{step.title}</h3>
                <p style={{ color: '#8B8B9E', fontSize: 15, lineHeight: 1.6, marginBottom: 12 }}>{step.subtitle}</p>
                <div className={`step-detail ${activeCard === i ? 'open' : ''}`}>
                  <div style={{ paddingTop: 12, borderTop: '1px solid #2A2A3A' }}>
                    <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.7 }}>{step.detail}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F7931A', fontSize: 13, fontWeight: 600, marginTop: 8 }}>
                  <span>{activeCard === i ? 'Show less' : 'Learn more'}</span>
                  <span style={{ transition: 'transform 0.3s', transform: activeCard === i ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>↓</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why Bitrove ── */}
      <section id="why-bitrove" style={{ padding: '120px 24px', backgroundColor: '#0D0D14' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: '#00D4AA', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Why Bitrove</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>
              Built different. <span style={{ color: '#00D4AA' }}>By design.</span>
            </h2>
            <p style={{ color: '#8B8B9E', fontSize: 18, maxWidth: 500, margin: '0 auto' }}>
              Everything about Bitrove is designed to give power back to the people.
            </p>
          </div>

          <div className="pillars-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {pillars.map((pillar, i) => (
              <div key={i} className="pillar-card">
                <div style={{ fontSize: 36, marginBottom: 16 }}>{pillar.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#fff' }}>{pillar.title}</h3>
                <p style={{ color: '#8B8B9E', fontSize: 14, lineHeight: 1.7 }}>{pillar.desc}</p>
              </div>
            ))}
          </div>

          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 64, padding: 40, borderRadius: 20, border: '1px solid #2A2A3A', background: '#13131A' }}>
            {[
              { value: '2%', label: 'Bitrove fee — lowest in the market' },
              { value: 'Polygon', label: 'Blockchain — fast and low cost' },
              { value: '7 days', label: 'Auto-release if no dispute raised' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, color: '#F7931A', marginBottom: 8 }}>{stat.value}</p>
                <p style={{ color: '#8B8B9E', fontSize: 14 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Waitlist ── */}
      <section id="waitlist" style={{ padding: '120px 24px', textAlign: 'center', position: 'relative' }}>
        <div className="mesh-bg" />
        <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, border: '1px solid rgba(247,147,26,0.4)', background: 'rgba(247,147,26,0.1)', fontSize: 12, fontWeight: 600, color: '#F7931A', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#F7931A', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            Launching Soon
          </div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.5rem', fontWeight: 800, marginBottom: 12 }}>Join the Waitlist.</h2>
          <p className="shimmer-text" style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: 24 }}>Be first to try Bitrove.</p>
          <p style={{ color: '#8B8B9E', fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>
            Get early access, exclusive listings, and zero fees for your first month.
          </p>
          {submitted ? (
            <div style={{ padding: '24px 32px', borderRadius: 16, border: '1px solid #00D4AA', backgroundColor: 'rgba(0,212,170,0.1)' }}>
              <p style={{ fontSize: 24 }}>🎉</p>
              <p style={{ color: '#00D4AA', fontWeight: 700, fontSize: 18, marginTop: 8 }}>You are on the list!</p>
              <p style={{ color: '#8B8B9E', fontSize: 14, marginTop: 4 }}>We will notify you the moment Bitrove goes live.</p>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '16px 20px', borderRadius: 12, fontSize: 16, width: '100%' }} />
              <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '16px 32px', borderRadius: 12, fontSize: 16, width: '100%' }}>
                {submitting ? 'Joining...' : 'Join Waitlist — Free'}
              </button>
            </form>
          )}
          <p style={{ color: '#4A4A5A', fontSize: 13, marginTop: 20 }}>No spam. No BS. Just early access.</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '40px 24px', borderTop: '1px solid #1A1A2A', textAlign: 'center' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: '#F7931A' }}>Bitrove</span>
        <p style={{ color: '#4A4A5A', fontSize: 13, marginTop: 12 }}>
          © 2026 Bitrove. Built on Polygon. Powered by XMTP. Prices sourced from Coinbase Australia.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
          <a href="/browse" style={{ color: '#8B8B9E', fontSize: 13, textDecoration: 'none' }}>Marketplace</a>
          <a href="/sell" style={{ color: '#8B8B9E', fontSize: 13, textDecoration: 'none' }}>Sell</a>
          <a href="/trades" style={{ color: '#8B8B9E', fontSize: 13, textDecoration: 'none' }}>My Trades</a>
        </div>
      </footer>

      {/* ── Coming Soon Modal ── */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: 480, margin: '0 24px', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(247,147,26,0.3)' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('/images/chat.png')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.3)' }} />
            <div style={{ position: 'relative', zIndex: 1, padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800, marginBottom: 12, color: '#fff' }}>Almost Ready!</h2>
              <p style={{ color: '#8B8B9E', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
                The Bitrove marketplace is not quite ready yet. Let us notify you the moment we go live.
              </p>
              {modalSubmitted ? (
                <div style={{ padding: '20px', borderRadius: 12, border: '1px solid #00D4AA', backgroundColor: 'rgba(0,212,170,0.1)', marginBottom: 24 }}>
                  <p style={{ color: '#00D4AA', fontWeight: 700 }}>🎉 You are on the list!</p>
                  <p style={{ color: '#8B8B9E', fontSize: 14, marginTop: 4 }}>We will notify you when Bitrove goes live.</p>
                </div>
              ) : (
                <form onSubmit={handleModalWaitlist} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  <input type="email" placeholder="your@email.com" value={modalEmail} onChange={e => setModalEmail(e.target.value)} required style={{ padding: '14px 18px', borderRadius: 10, fontSize: 15, width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #2A2A3A', color: '#fff', outline: 'none' }} />
                  <button type="submit" className="btn-primary" disabled={modalSubmitting} style={{ padding: '14px 24px', borderRadius: 10, fontSize: 15, width: '100%' }}>
                    {modalSubmitting ? 'Joining...' : 'Notify Me When Live'}
                  </button>
                </form>
              )}
              <button onClick={() => setShowModal(false)} style={{ color: '#8B8B9E', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}