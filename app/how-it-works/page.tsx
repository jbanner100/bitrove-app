'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── FAQ DATA ────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Do I need to create an account?",
    a: "No account, no email, no KYC. Connect your crypto wallet and you're in. Your wallet address is your identity on Bitrove — you own it, we don't."
  },
  {
    q: "What happens if I don't receive my item?",
    a: "Funds sit locked in the smart contract until you confirm receipt. If something's wrong, raise a dispute directly from your Trade Detail page. Bitrove's team reviews the evidence and can release or refund funds accordingly. The seller cannot access your payment until you confirm."
  },
  {
    q: "Can the seller run off with my money?",
    a: "No. This is the core value of escrow. Once you fund a trade, your crypto is locked in the smart contract on the blockchain — not held by the seller, not held by Bitrove. Only the contract rules can release it, and those rules require your confirmation."
  },
  {
    q: "What wallets are supported?",
    a: "MetaMask (desktop, recommended), Coinbase Wallet, Rainbow, Trust Wallet, and any WalletConnect-compatible wallet. For best experience on desktop, use MetaMask. Mobile wallets work but may have WalletConnect popup limitations."
  },
  {
    q: "What coins can I use to pay?",
    a: "USDT (Tether), WETH (Wrapped Ether), and WBTC (Wrapped Bitcoin) on the Polygon network. All prices are shown in AUD for clarity, converted live via Coinbase rates. Polygon means near-zero gas fees."
  },
  {
    q: "Is Bitrove free to use?",
    a: "Listing is free. Bitrove charges a 1% fee on confirmed trades, deducted automatically by the smart contract. No hidden fees, no subscription, no gas surprises — Polygon keeps transactions cheap."
  },
  {
    q: "Is my delivery address private?",
    a: "Yes. Your delivery address is encrypted with TweetNaCl end-to-end before it ever touches our database. Only the seller of that specific trade can decrypt it. Bitrove staff cannot read your delivery address."
  },
  {
    q: "How does the chat work?",
    a: "Bitrove has a built-in secure chat per listing. Messages are stored in our encrypted Supabase database, tied to the listing and your wallet address. No phone number, no email — just wallet-based identity."
  },
  {
    q: "Can I list physical items and digital goods?",
    a: "Yes. Bitrove supports physical goods with postage or local collection, and digital goods where delivery happens off-platform. You set your delivery type when listing."
  },
  {
    q: "What if I'm in a dispute and Bitrove rules against me unfairly?",
    a: "We take disputes seriously. All evidence is reviewed. If you believe a decision was wrong, email support@bitrove.io with your trade ID and full details. We are a small team and we care about getting this right."
  },
]

// ─── ACCORDION ───────────────────────────────────────────────────────────────
function Accordion({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (bodyRef.current) setHeight(open ? bodyRef.current.scrollHeight : 0)
  }, [open])

  return (
    <div
      onClick={onClick}
      className={`faq-item ${open ? 'open' : ''}`}
      style={{
        background: open ? 'rgba(247,147,26,0.06)' : 'rgba(19,19,26,0.8)',
        border: `1px solid ${open ? 'rgba(247,147,26,0.35)' : 'rgba(42,42,58,0.8)'}`,
        borderRadius: 12,
        marginBottom: 10,
        cursor: 'pointer',
        transition: 'background 0.3s, border 0.3s',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 22px',
        gap: 16,
      }}>
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '1rem',
          fontWeight: 600,
          color: open ? '#F7931A' : '#fff',
          transition: 'color 0.3s',
          lineHeight: 1.4,
        }}>{q}</span>
        <span style={{
          color: '#F7931A',
          fontSize: '1.3rem',
          fontWeight: 700,
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          flexShrink: 0,
          lineHeight: 1,
        }}>+</span>
      </div>
      <div style={{ height, transition: 'height 0.4s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden' }}>
        <div ref={bodyRef} style={{ padding: '0 22px 20px', color: '#8B8B9E', lineHeight: 1.7, fontSize: '0.93rem' }}>
          {a}
        </div>
      </div>
    </div>
  )
}

// ─── STEP CARD ───────────────────────────────────────────────────────────────
function StepCard({ n, icon, title, body }: { n: number; icon: string; title: string; body: string }) {
  return (
    <div className="step-card" style={{
      background: 'rgba(19,19,26,0.9)',
      border: '1px solid rgba(42,42,58,0.9)',
      borderRadius: 16,
      padding: '28px 26px',
      position: 'relative',
      transition: 'border-color 0.3s, transform 0.3s',
    }}>
      <div style={{
        position: 'absolute',
        top: -14,
        left: 22,
        background: '#F7931A',
        color: '#0A0A0F',
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        fontSize: '0.75rem',
        padding: '3px 11px',
        borderRadius: 20,
        letterSpacing: '0.08em',
      }}>STEP {n}</div>
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#fff', marginBottom: 8 }}>{title}</div>
      <div style={{ color: '#8B8B9E', fontSize: '0.9rem', lineHeight: 1.65 }}>{body}</div>
    </div>
  )
}

// ─── SECURITY BADGE ───────────────────────────────────────────────────────────
function SecurityBadge({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="sec-badge" style={{
      background: 'rgba(10,10,15,0.6)',
      border: '1px solid rgba(0,212,170,0.2)',
      borderRadius: 14,
      padding: '24px 22px',
      transition: 'border-color 0.3s, transform 0.3s',
    }}>
      <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{icon}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#00D4AA', fontSize: '0.95rem', marginBottom: 7 }}>{title}</div>
      <div style={{ color: '#8B8B9E', fontSize: '0.87rem', lineHeight: 1.65 }}>{body}</div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0A0A0F;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
        }

        .hiw-page {
          min-height: 100vh;
          background: #0A0A0F;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .hiw-page.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── NAV ── */
        .hiw-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(10,10,15,0.88);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(42,42,58,0.7);
          padding: 0 24px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .hiw-nav-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.25rem;
          color: #F7931A;
          text-decoration: none;
          letter-spacing: -0.02em;
        }
        .hiw-nav-back {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #8B8B9E;
          font-size: 0.88rem;
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 500;
        }
        .hiw-nav-back:hover { color: #fff; }

        /* ── HERO ── */
        .hiw-hero {
          text-align: center;
          padding: 80px 24px 60px;
          position: relative;
          overflow: hidden;
        }
        .hiw-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 10%, rgba(247,147,26,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .hiw-hero-eyebrow {
          display: inline-block;
          background: rgba(247,147,26,0.12);
          border: 1px solid rgba(247,147,26,0.3);
          color: #F7931A;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 6px 16px;
          border-radius: 20px;
          margin-bottom: 22px;
        }
        .hiw-hero h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          font-weight: 800;
          line-height: 1.12;
          letter-spacing: -0.03em;
          color: #fff;
          margin-bottom: 20px;
          max-width: 780px;
          margin-left: auto;
          margin-right: auto;
        }
        .hiw-hero h1 span { color: #00D4AA; }
        .hiw-hero p {
          font-size: 1.1rem;
          color: #8B8B9E;
          max-width: 580px;
          margin: 0 auto 36px;
          line-height: 1.7;
        }
        .hiw-cta-row {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-primary {
          background: #F7931A;
          color: #0A0A0F;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 12px 26px;
          border-radius: 10px;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.2s;
          letter-spacing: 0.02em;
          display: inline-block;
        }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-ghost {
          background: transparent;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 12px 26px;
          border-radius: 10px;
          border: 1px solid rgba(42,42,58,1);
          text-decoration: none;
          transition: border-color 0.2s, transform 0.2s;
          display: inline-block;
        }
        .btn-ghost:hover { border-color: #F7931A; transform: translateY(-1px); }

        /* ── SECTION LAYOUT ── */
        .hiw-section {
          max-width: 1060px;
          margin: 0 auto;
          padding: 60px 24px;
        }
        .section-label {
          font-family: 'Syne', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #F7931A;
          margin-bottom: 10px;
        }
        .section-heading {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.6rem, 3.5vw, 2.3rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 14px;
          letter-spacing: -0.02em;
        }
        .section-sub {
          color: #8B8B9E;
          font-size: 0.98rem;
          line-height: 1.7;
          max-width: 560px;
          margin-bottom: 44px;
        }
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(42,42,58,0.9), transparent);
          max-width: 1060px;
          margin: 0 auto;
        }

        /* ── GRIDS ── */
        .grid-2 { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .grid-3 { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .grid-4 { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; }

        .step-card:hover { border-color: rgba(247,147,26,0.35) !important; transform: translateY(-3px); }
        .sec-badge:hover { border-color: rgba(0,212,170,0.45) !important; transform: translateY(-3px); }

        /* ── ESCROW VISUAL ── */
        .escrow-flow {
          display: flex;
          align-items: center;
          gap: 0;
          flex-wrap: wrap;
          justify-content: center;
          margin: 40px 0;
          row-gap: 12px;
        }
        .escrow-node {
          background: rgba(19,19,26,0.9);
          border: 1px solid rgba(42,42,58,0.9);
          border-radius: 12px;
          padding: 18px 22px;
          text-align: center;
          min-width: 130px;
          flex-shrink: 0;
        }
        .escrow-node .icon { font-size: 1.8rem; margin-bottom: 6px; }
        .escrow-node .label { font-family: 'Syne', sans-serif; font-size: 0.78rem; font-weight: 700; color: #fff; }
        .escrow-node .sub { font-size: 0.73rem; color: #8B8B9E; margin-top: 3px; }
        .escrow-arrow {
          color: #F7931A;
          font-size: 1.4rem;
          padding: 0 8px;
          flex-shrink: 0;
        }
        .escrow-node.highlight {
          border-color: rgba(247,147,26,0.5);
          background: rgba(247,147,26,0.07);
        }
        .escrow-node.highlight .label { color: #F7931A; }

        /* ── COIN CHIPS ── */
        .coin-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 28px; }
        .coin-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(19,19,26,0.9);
          border: 1px solid rgba(42,42,58,0.9);
          border-radius: 12px;
          padding: 14px 20px;
          flex: 1;
          min-width: 160px;
          transition: border-color 0.25s;
        }
        .coin-chip:hover { border-color: rgba(247,147,26,0.4); }
        .coin-icon { font-size: 1.6rem; }
        .coin-name { font-family: 'Syne', sans-serif; font-weight: 700; color: #fff; font-size: 0.9rem; }
        .coin-desc { font-size: 0.78rem; color: #8B8B9E; margin-top: 2px; }

        /* ── WALLET ROW ── */
        .wallet-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 28px; }
        .wallet-chip {
          display: flex; align-items: center; gap: 10px;
          background: rgba(19,19,26,0.9);
          border: 1px solid rgba(42,42,58,0.9);
          border-radius: 10px;
          padding: 12px 18px;
          transition: border-color 0.25s;
        }
        .wallet-chip:hover { border-color: rgba(247,147,26,0.4); }
        .wallet-emoji { font-size: 1.4rem; }
        .wallet-name { font-family: 'Syne', sans-serif; font-weight: 700; color: #fff; font-size: 0.88rem; }
        .wallet-tag { font-size: 0.72rem; background: rgba(247,147,26,0.15); color: #F7931A; padding: 2px 7px; border-radius: 4px; font-weight: 600; margin-left: 4px; }

        /* ── WARNING BOX ── */
        .warning-box {
          background: rgba(255,68,68,0.06);
          border: 1px solid rgba(255,68,68,0.3);
          border-radius: 14px;
          padding: 28px 28px;
          margin-top: 20px;
        }
        .warning-box h3 { font-family: 'Syne', sans-serif; font-weight: 800; color: #ff4444; font-size: 1.05rem; margin-bottom: 14px; }
        .warning-row { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 10px; }
        .warning-row:last-child { margin-bottom: 0; }
        .warning-icon { color: #ff4444; font-size: 1rem; flex-shrink: 0; margin-top: 2px; }
        .warning-text { color: #c0c0cc; font-size: 0.9rem; line-height: 1.6; }
        .warning-text strong { color: #fff; }

        /* ── TEAL BOX ── */
        .teal-box {
          background: rgba(0,212,170,0.05);
          border: 1px solid rgba(0,212,170,0.25);
          border-radius: 14px;
          padding: 28px 28px;
          margin-top: 20px;
        }
        .teal-box h3 { font-family: 'Syne', sans-serif; font-weight: 800; color: #00D4AA; font-size: 1.05rem; margin-bottom: 14px; }

        /* ── CONTACT ── */
        .contact-row { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 28px; }
        .contact-card {
          flex: 1;
          min-width: 200px;
          background: rgba(19,19,26,0.9);
          border: 1px solid rgba(42,42,58,0.9);
          border-radius: 14px;
          padding: 22px 20px;
          transition: border-color 0.25s;
        }
        .contact-card:hover { border-color: rgba(247,147,26,0.4); }
        .contact-card .icon { font-size: 1.6rem; margin-bottom: 10px; }
        .contact-card .ctitle { font-family: 'Syne', sans-serif; font-weight: 700; color: #fff; font-size: 0.9rem; margin-bottom: 5px; }
        .contact-card .cdesc { color: #8B8B9E; font-size: 0.85rem; line-height: 1.55; }
        .contact-card a { color: #00D4AA; text-decoration: none; font-weight: 500; }
        .contact-card a:hover { text-decoration: underline; }

        /* ── FOOTER STRIP ── */
        .hiw-footer {
          border-top: 1px solid rgba(42,42,58,0.7);
          text-align: center;
          padding: 32px 24px;
          color: #8B8B9E;
          font-size: 0.83rem;
        }
        .hiw-footer span { color: #F7931A; }

        @media (max-width: 600px) {
          .escrow-arrow { transform: rotate(90deg); }
          .escrow-flow { flex-direction: column; align-items: center; }
          .hiw-hero { padding: 60px 20px 40px; }
          .hiw-section { padding: 44px 20px; }
        }
      `}</style>

      <div className={`hiw-page ${visible ? 'visible' : ''}`}>

        {/* ── NAV ── */}
        <nav className="hiw-nav">
          <Link href="/" className="hiw-nav-logo">Bitrove</Link>
          <Link href="/" className="hiw-nav-back">← Back to Home</Link>
        </nav>

        {/* ── HERO ── */}
        <section className="hiw-hero">
          <div className="hiw-hero-eyebrow">Transparency & Trust</div>
          <h1>How Bitrove <span>Actually Works</span></h1>
          <p>No banks. No middlemen. No KYC. Just smart contracts, crypto escrow, and peer-to-peer trust — explained in plain English.</p>
          <div className="hiw-cta-row">
            <Link href="/browse" className="btn-primary">Browse Listings</Link>
            <a href="#how-to-buy" className="btn-ghost">See the Buy Flow ↓</a>
          </div>
        </section>

        <div className="divider" />

        {/* ── WHAT IS BITROVE ── */}
        <section className="hiw-section">
          <div className="section-label">What We Are</div>
          <h2 className="section-heading">Gumtree meets Web3</h2>
          <p className="section-sub">
            Bitrove is a peer-to-peer marketplace where buyers and sellers transact directly using cryptocurrency — secured by a smart contract, not a corporation.
            Think eBay or Gumtree, but your funds are protected by code on the blockchain, not a terms-of-service document.
          </p>
          <div className="grid-3">
            {[
              { icon: '🚫', title: 'No KYC', body: 'No government ID, no email signup, no credit card. Connect your crypto wallet and start trading.' },
              { icon: '🔐', title: 'Escrow by Default', body: 'Every trade is protected. Funds are locked in a smart contract until you confirm receipt.' },
              { icon: '🌏', title: 'Australia-First', body: 'Built for Aussies. All prices shown in AUD. Local pickup or postage — your choice.' },
              { icon: '⛓️', title: 'On-Chain Settlement', body: 'Trades settle on Polygon blockchain. Transparent, verifiable, and nobody can rewrite history.' },
              { icon: '💬', title: 'Built-In Chat', body: 'Message your buyer or seller directly in the listing. No DMs needed on external platforms.' },
              { icon: '📍', title: 'Location-Based', body: 'Add your suburb to your listing so local buyers can find you for collection or short-distance deals.' },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{
                background: 'rgba(19,19,26,0.9)',
                border: '1px solid rgba(42,42,58,0.9)',
                borderRadius: 14,
                padding: '22px 20px',
              }}>
                <div style={{ fontSize: '1.6rem', marginBottom: 10 }}>{icon}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: 7 }}>{title}</div>
                <div style={{ color: '#8B8B9E', fontSize: '0.87rem', lineHeight: 1.65 }}>{body}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* ── CONNECT WALLET ── */}
        <section className="hiw-section">
          <div className="section-label">Getting Started</div>
          <h2 className="section-heading">How to Connect Your Wallet</h2>
          <p className="section-sub">
            Your crypto wallet is your Bitrove account. No username, no password — just connect and go.
          </p>
          <div className="grid-2">
            <StepCard n={1} icon="📥" title="Install a Wallet" body="Download MetaMask (Chrome/Firefox extension) or Coinbase Wallet. Create a wallet and safely store your seed phrase — this is the most important step. Never share your seed phrase with anyone, ever." />
            <StepCard n={2} icon="🔗" title="Add Polygon Network" body="Bitrove runs on Polygon (MATIC network). MetaMask will prompt you to add Polygon automatically when you click Connect on Bitrove. Polygon has near-zero gas fees — a fraction of a cent per transaction." />
            <StepCard n={3} icon="💰" title="Add Supported Tokens" body="You'll need USDT, WETH or WBTC on Polygon in your wallet to buy. Use a centralised exchange like Coinbase or Independent Reserve to purchase crypto, then bridge or send to your Polygon wallet." />
            <StepCard n={4} icon="✅" title="Click Connect Wallet" body='Hit "Connect Wallet" in the top right of any Bitrove page. Select your wallet, approve the connection — no signing, no fees. You\'re in.' />
          </div>

          <div style={{ marginTop: 36 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: 16 }}>Supported Wallets</div>
            <div className="wallet-row">
              {[
                { emoji: '🦊', name: 'MetaMask', tag: 'RECOMMENDED' },
                { emoji: '🔵', name: 'Coinbase Wallet', tag: null },
                { emoji: '🌈', name: 'Rainbow', tag: null },
                { emoji: '🛡️', name: 'Trust Wallet', tag: null },
                { emoji: '🔌', name: 'WalletConnect', tag: 'COMPATIBLE' },
              ].map(({ emoji, name, tag }) => (
                <div key={name} className="wallet-chip">
                  <span className="wallet-emoji">{emoji}</span>
                  <span className="wallet-name">{name}</span>
                  {tag && <span className="wallet-tag">{tag}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ── WHAT IS A SMART CONTRACT ── */}
        <section className="hiw-section">
          <div className="section-label">Plain English</div>
          <h2 className="section-heading">What is a Smart Contract?</h2>
          <p className="section-sub">
            You don't need to be technical to understand this. Here's the honest, simple version.
          </p>
          <div style={{
            background: 'rgba(19,19,26,0.9)',
            border: '1px solid rgba(42,42,58,0.9)',
            borderRadius: 16,
            padding: '32px 30px',
            display: 'grid',
            gap: 20,
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#F7931A', fontSize: '0.85rem', marginBottom: 10, letterSpacing: '0.05em' }}>🏦 THE OLD WAY (PayPal / eBay)</div>
              <div style={{ color: '#8B8B9E', fontSize: '0.9rem', lineHeight: 1.7 }}>
                You send money to a company. They hold it. They decide when to release it. If they freeze your account, go bankrupt, or make a mistake — you're at their mercy. You trust the <em>company</em>.
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#00D4AA', fontSize: '0.85rem', marginBottom: 10, letterSpacing: '0.05em' }}>⛓️ THE BITROVE WAY (Smart Contract)</div>
              <div style={{ color: '#8B8B9E', fontSize: '0.9rem', lineHeight: 1.7 }}>
                You send crypto to an autonomous program on the blockchain — not to us, not to the seller. The code defines every rule: when to release funds, who gets them, and what happens in a dispute. Nobody can change those rules, and nobody can steal the funds. You trust the <em>code</em>.
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: '16px 22px', background: 'rgba(247,147,26,0.06)', border: '1px solid rgba(247,147,26,0.2)', borderRadius: 10, fontSize: '0.88rem', color: '#8B8B9E', lineHeight: 1.6 }}>
            🔍 <strong style={{ color: '#fff' }}>Bitrove's contract is publicly verified</strong> — you can read every line of code on Polygonscan:{' '}
            <a href="https://polygonscan.com/address/0xbc9359071020025f1a13f34a48376e1cff839377" target="_blank" rel="noopener noreferrer" style={{ color: '#00D4AA', textDecoration: 'none' }}>0xbc9359...839377</a>
          </div>
        </section>

        <div className="divider" />

        {/* ── HOW TO BUY ── */}
        <section id="how-to-buy" className="hiw-section">
          <div className="section-label">Buying</div>
          <h2 className="section-heading">How to Buy an Item</h2>
          <p className="section-sub">Five simple steps. The escrow contract does all the heavy lifting.</p>
          <div className="grid-2">
            <StepCard n={1} icon="🔍" title="Find a Listing" body="Browse by category, search by keyword, or filter by location. All prices are shown in AUD with live crypto conversion rates from Coinbase." />
            <StepCard n={2} icon="💬" title="Message the Seller" body="Use the built-in chat to ask questions about the item, postage options, or meet-up details. No need to share your phone number or email." />
            <StepCard n={3} icon="✅" title="Approve Token Spend" body='Click "Buy Now", enter your delivery address (encrypted before storage), then approve the smart contract to access your tokens. MetaMask pops up — this is normal.' />
            <StepCard n={4} icon="🔒" title="Funds Lock in Escrow" body="Your crypto is sent to the smart contract, not the seller. The seller ships your item knowing the funds are guaranteed. They cannot receive payment until you confirm receipt." />
            <StepCard n={5} icon="📦" title="Receive & Confirm" body='Item arrives? Hit "Confirm Receipt" in My Trades. Funds instantly release to the seller. That\'s it. Trade complete.' />
            <StepCard n={6} icon="🚩" title="Problem? Raise a Dispute" body="If something's wrong, hit 'Raise Dispute' before confirming. Bitrove's team reviews evidence from both sides and makes a fair call. Funds stay locked until resolved." />
          </div>
        </section>

        <div className="divider" />

        {/* ── ESCROW FLOW VISUAL ── */}
        <section className="hiw-section" style={{ paddingTop: 0 }}>
          <div className="section-label">Escrow Explained</div>
          <h2 className="section-heading">Where Does the Money Go?</h2>
          <p className="section-sub">This is what makes Bitrove trustworthy. Your funds never touch the seller's wallet until you say so.</p>

          <div className="escrow-flow">
            <div className="escrow-node">
              <div className="icon">🛒</div>
              <div className="label">Buyer</div>
              <div className="sub">You</div>
            </div>
            <div className="escrow-arrow">→</div>
            <div className="escrow-node highlight">
              <div className="icon">⛓️</div>
              <div className="label">Smart Contract</div>
              <div className="sub">Funds locked here</div>
            </div>
            <div className="escrow-arrow">→</div>
            <div className="escrow-node">
              <div className="icon">📦</div>
              <div className="label">Seller Ships</div>
              <div className="sub">Item delivered</div>
            </div>
            <div className="escrow-arrow">→</div>
            <div className="escrow-node">
              <div className="icon">✅</div>
              <div className="label">You Confirm</div>
              <div className="sub">Receipt confirmed</div>
            </div>
            <div className="escrow-arrow">→</div>
            <div className="escrow-node">
              <div className="icon">💸</div>
              <div className="label">Seller Paid</div>
              <div className="sub">Instantly released</div>
            </div>
          </div>

          <div className="teal-box">
            <h3>🔐 What Bitrove's 1% Fee Covers</h3>
            <p style={{ color: '#8B8B9E', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Bitrove charges a 1% fee on confirmed trades, automatically deducted by the smart contract. This covers platform development, dispute resolution, hosting, and ongoing security. There are no listing fees, no subscription charges, and no hidden costs. You only pay when a trade succeeds.
            </p>
          </div>
        </section>

        <div className="divider" />

        {/* ── HOW TO SELL ── */}
        <section className="hiw-section">
          <div className="section-label">Selling</div>
          <h2 className="section-heading">How to List an Item</h2>
          <p className="section-sub">Listing is free. Takes two minutes.</p>
          <div className="grid-2">
            <StepCard n={1} icon="📝" title="Create Your Listing" body="Click Sell. Add a title, description, category, condition, your suburb or region, and set your AUD price. The live crypto equivalent is shown automatically." />
            <StepCard n={2} icon="📸" title="Add Photos" body="Upload up to multiple square photos of your item. Good photos = faster sales. Photos are stored securely in Bitrove's cloud storage." />
            <StepCard n={3} icon="🚚" title="Set Delivery Type" body='Choose "Postage" (add flat AUD postage cost, or include it free) or "Collection Only" for local pickup. Buyers see this clearly before purchasing.' />
            <StepCard n={4} icon="📍" title="Add Your Location" body="Enter your suburb or region so nearby buyers can find your listing and consider local collection. Your full address is never shown publicly." />
            <StepCard n={5} icon="🔢" title="Set Quantity" body="Selling multiples? Set quantity. Each confirmed trade automatically decrements stock. Listing marks as sold when stock hits zero." />
            <StepCard n={6} icon="⚡" title="Go Live" body="Hit Publish. Your listing is live on Bitrove immediately. Buyers can find it via search and category browsing. You'll see all activity in My Trades." />
          </div>
        </section>

        <div className="divider" />

        {/* ── SUPPORTED COINS ── */}
        <section className="hiw-section">
          <div className="section-label">Payments</div>
          <h2 className="section-heading">Supported Payment Tokens</h2>
          <p className="section-sub">All trades settle on Polygon — fast confirmations and near-zero gas fees.</p>
          <div className="coin-row">
            <div className="coin-chip">
              <span className="coin-icon">💵</span>
              <div>
                <div className="coin-name">USDT</div>
                <div className="coin-desc">Tether — USD stablecoin. No price volatility. Great for everyday trades.</div>
              </div>
            </div>
            <div className="coin-chip">
              <span className="coin-icon">🔷</span>
              <div>
                <div className="coin-name">WETH</div>
                <div className="coin-desc">Wrapped Ether on Polygon. Bridged from Ethereum mainnet.</div>
              </div>
            </div>
            <div className="coin-chip">
              <span className="coin-icon">₿</span>
              <div>
                <div className="coin-name">WBTC</div>
                <div className="coin-desc">Wrapped Bitcoin. Pay with BTC value on Polygon's fast network.</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: '14px 20px', background: 'rgba(19,19,26,0.6)', borderRadius: 10, fontSize: '0.86rem', color: '#8B8B9E', border: '1px solid rgba(42,42,58,0.7)' }}>
            💡 <strong style={{ color: '#fff' }}>Tip for Beginners:</strong> USDT is the easiest starting point — its value matches the USD and avoids crypto price swings during the trade window. All prices are shown in AUD with live conversion.
          </div>
        </section>

        <div className="divider" />

        {/* ── LOCATION ── */}
        <section className="hiw-section">
          <div className="section-label">Location</div>
          <h2 className="section-heading">Finding Local Deals</h2>
          <p className="section-sub">Bitrove supports location-based listings so you can trade with people nearby.</p>
          <div className="grid-2">
            {[
              { icon: '📍', title: 'Suburb Visibility', body: 'Sellers add their suburb or region to listings. This is shown publicly so buyers can assess distance before purchasing or messaging.' },
              { icon: '🔍', title: 'Filter by Location', body: 'Browse listings filtered by your state or region. Great for finding items available for local collection, avoiding postage costs entirely.' },
              { icon: '🤝', title: 'Safe Meetups', body: 'For collection trades, we recommend meeting in a public location — a busy café, shopping centre, or police station front car park. Always during daylight hours.' },
              { icon: '🔒', title: 'Delivery Address Privacy', body: 'When buying a postage item, you enter your delivery address. It is encrypted immediately with end-to-end encryption before storage. Only the seller of that trade can read it.' },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{
                display: 'flex',
                gap: 16,
                background: 'rgba(19,19,26,0.9)',
                border: '1px solid rgba(42,42,58,0.9)',
                borderRadius: 14,
                padding: '20px 20px',
              }}>
                <div style={{ fontSize: '1.6rem', flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.93rem', marginBottom: 6 }}>{title}</div>
                  <div style={{ color: '#8B8B9E', fontSize: '0.87rem', lineHeight: 1.65 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* ── CHAT SYSTEM ── */}
        <section className="hiw-section">
          <div className="section-label">Communication</div>
          <h2 className="section-heading">The Secure Chat System</h2>
          <p className="section-sub">Every listing has its own private chat between buyer and seller. No phone numbers, no email addresses required.</p>
          <div className="grid-3">
            {[
              { icon: '💬', title: 'Per-Listing Chat', body: 'Each conversation is tied to a specific listing and your wallet address. Clean, organised, and separate from other listings.' },
              { icon: '🔏', title: 'Wallet-Gated Identity', body: 'Only wallet holders can send messages. No fake accounts, no bots — every message is tied to a real crypto wallet.' },
              { icon: '📱', title: 'Works on All Devices', body: 'Our messaging system works across desktop, mobile, and all wallet types. No app download required.' },
              { icon: '🚩', title: 'Report Bad Actors', body: 'See something suspicious? Use the 🚩 Report button on any listing. Bitrove reviews all reports.' },
              { icon: '👀', title: 'My Chats Overview', body: 'Access all your conversations from the My Trades → My Chats tab. Shows listing photo and title for easy identification.' },
              { icon: '🔔', title: 'Unread Indicators', body: 'Unread message badges show you when new messages are waiting. Check My Trades to stay on top of active conversations.' },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{
                background: 'rgba(19,19,26,0.9)',
                border: '1px solid rgba(42,42,58,0.9)',
                borderRadius: 14,
                padding: '20px 18px',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{icon}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: 6 }}>{title}</div>
                <div style={{ color: '#8B8B9E', fontSize: '0.85rem', lineHeight: 1.65 }}>{body}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* ── WHY BITROVE IS SECURE ── */}
        <section className="hiw-section">
          <div className="section-label">Security</div>
          <h2 className="section-heading">Why Bitrove is Secure</h2>
          <p className="section-sub">Security isn't a feature — it's the foundation everything is built on.</p>
          <div className="grid-3">
            <SecurityBadge icon="⛓️" title="On-Chain Escrow" body="Your funds are held by an autonomous smart contract on Polygon. No human — including Bitrove staff — can move your funds without following the contract rules." />
            <SecurityBadge icon="🔍" title="Publicly Verified Contract" body="Bitrove's escrow contract is open source and verified on Polygonscan. Anyone can audit every line of code. No hidden backdoors." />
            <SecurityBadge icon="🔐" title="Encrypted Delivery Addresses" body="Delivery addresses are encrypted client-side using TweetNaCl before they reach our servers. Only the seller of that specific trade holds the decryption key." />
            <SecurityBadge icon="🦺" title="No Custody of Funds" body="Bitrove never holds your crypto. We are not a custodian. Your tokens go directly into the smart contract, which releases them according to the trade outcome." />
            <SecurityBadge icon="🚫" title="No Account Required" body="No email means no phishing surface. No password means no password breach. Your wallet is your login — and only you control it." />
            <SecurityBadge icon="🛡️" title="Dispute Resolution" body="In any dispute, funds remain locked. Neither party can touch them. Bitrove reviews evidence and arbitrates fairly before any release." />
          </div>
        </section>

        <div className="divider" />

        {/* ── SECURITY TIPS / SCAM WARNING ── */}
        <section className="hiw-section">
          <div className="section-label">Stay Safe</div>
          <h2 className="section-heading">Security Tips & Scam Warnings</h2>
          <p className="section-sub">The blockchain is secure. Humans are the attack surface. Here's how to stay safe.</p>

          <div className="warning-box">
            <h3>🚨 Bitrove Will NEVER:</h3>
            {[
              ['Ask for your seed phrase or private key', 'Anyone who asks for your seed phrase is a scammer. Full stop. Your seed phrase gives total access to your wallet. Guard it with your life.'],
              ['DM you first on Telegram, Discord or any social platform', 'Bitrove does not have support agents reaching out to you. If someone claims to be Bitrove staff in a DM — they are lying.'],
              ['Ask you to send crypto to "verify" your wallet', 'This is a classic scam. No legitimate platform asks you to send crypto as verification.'],
              ['Ask you to approve an unknown contract or token', 'Only approve transactions on bitrove.com.au or bitrove.io. Check your browser URL bar every time.'],
              ['Ask you to install remote desktop or screen sharing software', 'Never give anyone screen access to a device with your wallet. This is the fastest way to lose everything.'],
            ].map(([title, detail]) => (
              <div key={title as string} className="warning-row">
                <span className="warning-icon">✕</span>
                <div className="warning-text"><strong>{title as string}.</strong> {detail as string}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="teal-box">
              <h3>✅ Always Check:</h3>
              <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                {[
                  ['🔗 Valid URL', 'Only trust bitrove.com.au or bitrove.io. Bookmark it. Do not click links from strangers.'],
                  ['🔒 HTTPS Padlock', 'Always look for the padlock icon in your browser. If it\'s missing, leave immediately.'],
                  ['🦊 Transaction Details', 'Before approving any MetaMask popup, verify the contract address matches Bitrove\'s official contract.'],
                  ['👥 Seller Reputation', 'Check trade history. Use chat to ask questions. Trust your instincts — if a deal seems too good to be true, it probably is.'],
                ].map(([title, detail]) => (
                  <div key={title as string} style={{ fontSize: '0.87rem', color: '#8B8B9E', lineHeight: 1.6 }}>
                    <strong style={{ color: '#00D4AA', display: 'block', marginBottom: 4 }}>{title as string}</strong>
                    {detail as string}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ── FAQs ── */}
        <section className="hiw-section">
          <div className="section-label">FAQs</div>
          <h2 className="section-heading">Frequently Asked Questions</h2>
          <p className="section-sub">Still have questions? These cover the most common ones.</p>
          <div>
            {faqs.map((faq, i) => (
              <Accordion
                key={i}
                q={faq.q}
                a={faq.a}
                open={openFaq === i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* ── CONTACT ── */}
        <section className="hiw-section">
          <div className="section-label">Support</div>
          <h2 className="section-heading">How to Contact Bitrove</h2>
          <p className="section-sub">
            We're a small team. We care. Response times may vary but we read everything.
          </p>
          <div className="contact-row">
            <div className="contact-card">
              <div className="icon">📧</div>
              <div className="ctitle">Email Support</div>
              <div className="cdesc">For trade disputes, account questions, or anything else:<br /><a href="mailto:gm@bitrove.io">gm@bitrove.io</a><br /><br />Include your trade ID and wallet address for fastest response.</div>
            </div>
            <div className="contact-card">
              <div className="icon">🚩</div>
              <div className="ctitle">Report a Listing</div>
              <div className="cdesc">See a scam or inappropriate listing? Use the 🚩 report button directly on the listing page. We review all reports and act quickly on confirmed violations.</div>
            </div>
            <div className="contact-card">
              <div className="icon">⚖️</div>
              <div className="ctitle">Dispute a Trade</div>
              <div className="cdesc">Open your Trade Detail from My Trades and hit "Raise Dispute". Funds stay locked while we review. Provide as much evidence as possible — photos, screenshots, tracking numbers.</div>
            </div>
          </div>

          <div style={{ marginTop: 20, padding: '16px 22px', background: 'rgba(19,19,26,0.6)', borderRadius: 10, border: '1px solid rgba(42,42,58,0.7)', fontSize: '0.86rem', color: '#8B8B9E' }}>
            ⚠️ <strong style={{ color: '#fff' }}>Verify you're contacting real Bitrove:</strong> Official email is <strong style={{ color: '#00D4AA' }}>gm@bitrove.io</strong>. Our only websites are <strong style={{ color: '#00D4AA' }}>bitrove.com.au</strong> and <strong style={{ color: '#00D4AA' }}>bitrove.io</strong>. We do not have a Telegram group, Discord server, or any official social media accounts. Do not trust anyone claiming to represent Bitrove elsewhere.
          </div>
        </section>

        <div className="divider" />

        {/* ── FINAL CTA ── */}
        <section style={{ textAlign: 'center', padding: '70px 24px' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em' }}>
            Ready to Trade?
          </div>
          <p style={{ color: '#8B8B9E', fontSize: '1rem', marginBottom: 32, maxWidth: 460, margin: '0 auto 32px' }}>
            No KYC. No banks. Just you, your wallet, and the blockchain.
          </p>
          <div className="hiw-cta-row">
            <Link href="/browse" className="btn-primary">Browse Listings</Link>
            <Link href="/sell" className="btn-ghost">Sell Something</Link>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <div className="hiw-footer">
          <span>Bitrove</span> — Buy. Sell. Get paid in crypto. 🚀 &nbsp;|&nbsp; Built on Polygon &nbsp;|&nbsp; <a href="mailto:gm@bitrove.io" style={{ color: '#8B8B9E', textDecoration: 'none' }}>gm@bitrove.io</a>
        </div>

      </div>
    </>
  )
}
