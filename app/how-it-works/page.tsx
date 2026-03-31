'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const faqs = [
  { q: "Do I need to create an account?", a: "No account, no email, no KYC. Connect your crypto wallet and you are in. Your wallet address is your identity on Bitrove — you own it, we do not." },
  { q: "What happens if I do not receive my item?", a: "Funds sit locked in the smart contract until you confirm receipt. If something is wrong, raise a dispute directly from your Trade Detail page. Bitrove reviews the evidence and can release or refund funds. The seller cannot access your payment until you confirm." },
  { q: "Can the seller run off with my money?", a: "No. This is the core value of escrow. Once you fund a trade, your crypto is locked in the smart contract on the blockchain — not held by the seller, not held by Bitrove. Only the contract rules can release it, and those rules require your confirmation." },
  { q: "What wallets are supported?", a: "MetaMask (desktop, recommended), Coinbase Wallet, Rainbow, Trust Wallet, and any WalletConnect-compatible wallet. For best experience on desktop, use MetaMask. Mobile wallets work but may have WalletConnect popup limitations." },
  { q: "What coins can I use to pay?", a: "USDT (Tether), WETH (Wrapped Ether), and WBTC (Wrapped Bitcoin) on the Polygon network. All prices are shown in AUD for clarity, converted live via Coinbase rates. Polygon means near-zero gas fees." },
  { q: "Is Bitrove free to use?", a: "Listing is free. Bitrove charges a 1% fee on confirmed trades, deducted automatically by the smart contract. No hidden fees, no subscription, no gas surprises — Polygon keeps transactions cheap." },
  { q: "Is my delivery address private?", a: "Yes. Your delivery address is encrypted with TweetNaCl end-to-end before it ever touches our database. Only the seller of that specific trade can decrypt it. Bitrove staff cannot read your delivery address." },
  { q: "How does the chat work?", a: "Bitrove has a built-in secure chat per listing. Messages are stored in our Supabase database, tied to the listing and your wallet address. No phone number, no email — just wallet-based identity." },
  { q: "Can I list physical items and digital goods?", a: "Yes. Bitrove supports physical goods with postage or local collection, and digital goods where delivery happens off-platform. You set your delivery type when listing." },
  { q: "What if I am in a dispute and Bitrove rules against me unfairly?", a: "We take disputes seriously. All evidence is reviewed. If you believe a decision was wrong, email gm@bitrove.io with your trade ID and full details. We are a small team and we care about getting this right." },
]

const warnings = [
  { title: 'Ask for your seed phrase or private key', detail: 'Anyone who asks for your seed phrase is a scammer. Your seed phrase gives total access to your wallet. Guard it with your life.' },
  { title: 'DM you first on Telegram, Discord or any social platform', detail: 'Bitrove does not have support agents reaching out to you. If someone claims to be Bitrove staff in a DM — they are lying.' },
  { title: 'Ask you to send crypto to verify your wallet', detail: 'This is a classic scam. No legitimate platform asks you to send crypto as verification.' },
  { title: 'Ask you to approve an unknown contract or token', detail: 'Only approve transactions on bitrove.com.au or bitrove.io. Check your browser URL bar every single time.' },
  { title: 'Ask you to install remote desktop or screen sharing software', detail: 'Never give anyone screen access to a device with your wallet. This is the fastest way to lose everything.' },
]

const safetyTips = [
  { title: '🔗 Valid URL', detail: 'Only trust bitrove.com.au or bitrove.io. Bookmark it. Do not click links from strangers.' },
  { title: '🔒 HTTPS Padlock', detail: 'Always look for the padlock icon in your browser. If it is missing, leave immediately.' },
  { title: '🦊 Transaction Details', detail: 'Before approving any MetaMask popup, verify the contract address matches Bitrove official contract.' },
  { title: '👥 Seller Reputation', detail: 'Check trade history. Use chat to ask questions. If a deal seems too good to be true, it probably is.' },
]

function Accordion({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  useEffect(() => { if (bodyRef.current) setHeight(open ? bodyRef.current.scrollHeight : 0) }, [open])
  return (
    <div onClick={onClick} style={{ background: open ? 'rgba(247,147,26,0.06)' : 'rgba(19,19,26,0.8)', border: `1px solid ${open ? 'rgba(247,147,26,0.35)' : 'rgba(42,42,58,0.8)'}`, borderRadius: 12, marginBottom: 10, cursor: 'pointer', transition: 'background 0.3s, border 0.3s', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', gap: 16 }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 600, color: open ? '#F7931A' : '#fff', transition: 'color 0.3s', lineHeight: 1.4 }}>{q}</span>
        <span style={{ color: '#F7931A', fontSize: '1.3rem', fontWeight: 700, transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)', flexShrink: 0 }}>+</span>
      </div>
      <div style={{ height, transition: 'height 0.4s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden' }}>
        <div ref={bodyRef} style={{ padding: '0 22px 20px', color: '#8B8B9E', lineHeight: 1.7, fontSize: '0.93rem' }}>{a}</div>
      </div>
    </div>
  )
}

function StepCard({ n, icon, title, body }: { n: number; icon: string; title: string; body: string }) {
  return (
    <div style={{ background: 'rgba(19,19,26,0.9)', border: '1px solid rgba(42,42,58,0.9)', borderRadius: 16, padding: '28px 26px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -14, left: 22, background: '#F7931A', color: '#0A0A0F', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.75rem', padding: '3px 11px', borderRadius: 20, letterSpacing: '0.08em' }}>STEP {n}</div>
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#fff', marginBottom: 8 }}>{title}</div>
      <div style={{ color: '#8B8B9E', fontSize: '0.9rem', lineHeight: 1.65 }}>{body}</div>
    </div>
  )
}

function SecurityBadge({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{ background: 'rgba(10,10,15,0.6)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 14, padding: '24px 22px' }}>
      <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{icon}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#00D4AA', fontSize: '0.95rem', marginBottom: 7 }}>{title}</div>
      <div style={{ color: '#8B8B9E', fontSize: '0.87rem', lineHeight: 1.65 }}>{body}</div>
    </div>
  )
}

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t) }, [])

  const S = { maxWidth: 1060, margin: '0 auto', padding: '60px 24px' }
  const H: React.CSSProperties = { fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 14, letterSpacing: '-0.02em' }
  const L: React.CSSProperties = { fontFamily: "'Syne', sans-serif", fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#F7931A', marginBottom: 10 }
  const P = { color: '#8B8B9E', fontSize: '0.98rem', lineHeight: 1.7, maxWidth: 560, marginBottom: 44 }
  const DIV = { height: 1, background: 'linear-gradient(to right, transparent, rgba(42,42,58,0.9), transparent)', maxWidth: 1060, margin: '0 auto' }
  const G2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }
  const G3 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0F; color: #fff; font-family: 'DM Sans', sans-serif; }
        .hiw { min-height: 100vh; background: #0A0A0F; opacity: 0; transform: translateY(18px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .hiw.on { opacity: 1; transform: translateY(0); }
        .topnav { position: sticky; top: 0; z-index: 100; background: rgba(10,10,15,0.88); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(42,42,58,0.7); padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
        .btn-o { background: #F7931A; color: #0A0A0F; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.9rem; padding: 12px 26px; border-radius: 10px; text-decoration: none; display: inline-block; transition: opacity 0.2s, transform 0.2s; }
        .btn-o:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-g { background: transparent; color: #fff; font-family: 'Syne',sans-serif; font-weight: 600; font-size: 0.9rem; padding: 12px 26px; border-radius: 10px; border: 1px solid rgba(42,42,58,1); text-decoration: none; display: inline-block; transition: border-color 0.2s, transform 0.2s; }
        .btn-g:hover { border-color: #F7931A; transform: translateY(-1px); }
        .basecard { background: rgba(19,19,26,0.9); border: 1px solid rgba(42,42,58,0.9); border-radius: 14px; padding: 22px 20px; transition: border-color 0.25s; }
        .basecard:hover { border-color: rgba(247,147,26,0.35); }
        .coin { display: flex; align-items: center; gap: 10px; background: rgba(19,19,26,0.9); border: 1px solid rgba(42,42,58,0.9); border-radius: 12px; padding: 14px 20px; flex: 1; min-width: 160px; transition: border-color 0.25s; }
        .coin:hover { border-color: rgba(247,147,26,0.4); }
        .wchip { display: flex; align-items: center; gap: 10px; background: rgba(19,19,26,0.9); border: 1px solid rgba(42,42,58,0.9); border-radius: 10px; padding: 12px 18px; transition: border-color 0.25s; }
        .wchip:hover { border-color: rgba(247,147,26,0.4); }
        .ccard { flex: 1; min-width: 200px; background: rgba(19,19,26,0.9); border: 1px solid rgba(42,42,58,0.9); border-radius: 14px; padding: 22px 20px; transition: border-color 0.25s; }
        .ccard:hover { border-color: rgba(247,147,26,0.4); }
        .eflow { display: flex; align-items: center; flex-wrap: wrap; justify-content: center; margin: 40px 0; row-gap: 12px; }
        .enode { background: rgba(19,19,26,0.9); border: 1px solid rgba(42,42,58,0.9); border-radius: 12px; padding: 18px 22px; text-align: center; min-width: 130px; flex-shrink: 0; }
        .enode.hl { border-color: rgba(247,147,26,0.5); background: rgba(247,147,26,0.07); }
        @media (max-width: 600px) { .eflow { flex-direction: column; align-items: center; } }
      `}</style>

      <div className={`hiw${visible ? ' on' : ''}`}>

        {/* NAV */}
        <nav className="topnav">
          <Link href="/" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#F7931A', textDecoration: 'none' }}>Bitrove</Link>
          <Link href="/" style={{ color: '#8B8B9E', fontSize: '0.88rem', textDecoration: 'none', fontWeight: 500 }}>← Back to Home</Link>
        </nav>

        {/* HERO */}
        <section style={{ textAlign: 'center', padding: '80px 24px 60px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 10%, rgba(247,147,26,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'inline-block', background: 'rgba(247,147,26,0.12)', border: '1px solid rgba(247,147,26,0.3)', color: '#F7931A', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: 20, marginBottom: 22 }}>
            Transparency &amp; Trust
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.03em', color: '#fff', marginBottom: 20, maxWidth: 780, marginLeft: 'auto', marginRight: 'auto' }}>
            How Bitrove <span style={{ color: '#00D4AA' }}>Actually Works</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#8B8B9E', maxWidth: 580, margin: '0 auto 36px', lineHeight: 1.7 }}>
            No banks. No middlemen. No KYC. Just smart contracts, crypto escrow, and peer-to-peer trust — explained in plain English.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/browse" className="btn-o">Browse Listings</Link>
            <a href="#escrow" className="btn-g">See Escrow Flow ↓</a>
          </div>
        </section>

        <div style={DIV} />

        {/* WHAT IS BITROVE */}
        <section style={S}>
          <div style={L}>What We Are</div>
          <h2 style={H}>Gumtree meets Web3</h2>
          <p style={P}>Bitrove is a peer-to-peer marketplace where buyers and sellers transact directly using cryptocurrency — secured by a smart contract, not a corporation. Think eBay or Gumtree, but your funds are protected by code on the blockchain, not a terms-of-service document.</p>
          <div style={G3}>
            {[
              { icon: '🚫', title: 'No KYC', body: 'No government ID, no email signup, no credit card. Connect your crypto wallet and start trading.' },
              { icon: '🔐', title: 'Escrow by Default', body: 'Every trade is protected. Funds are locked in a smart contract until you confirm receipt.' },
              { icon: '🌏', title: 'Australia-First', body: 'Built for Aussies. All prices shown in AUD. Local pickup or postage — your choice.' },
              { icon: '⛓️', title: 'On-Chain Settlement', body: 'Trades settle on Polygon blockchain. Transparent, verifiable, and nobody can rewrite history.' },
              { icon: '💬', title: 'Built-In Chat', body: 'Message your buyer or seller directly in the listing. No DMs needed on external platforms.' },
              { icon: '📍', title: 'Location-Based', body: 'Add your suburb so local buyers can find you for collection or short-distance deals.' },
            ].map(({ icon, title, body }) => (
              <div key={title} className="basecard">
                <div style={{ fontSize: '1.6rem', marginBottom: 10 }}>{icon}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: 7 }}>{title}</div>
                <div style={{ color: '#8B8B9E', fontSize: '0.87rem', lineHeight: 1.65 }}>{body}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={DIV} />

        {/* CONNECT WALLET */}
        <section style={S}>
          <div style={L}>Getting Started</div>
          <h2 style={H}>How to Connect Your Wallet</h2>
          <p style={P}>Your crypto wallet is your Bitrove account. No username, no password — just connect and go.</p>
          <div style={G2}>
            <StepCard n={1} icon="📥" title="Install a Wallet" body="Download MetaMask (Chrome or Firefox extension) or Coinbase Wallet. Create a wallet and safely store your seed phrase offline. Never share your seed phrase with anyone, ever." />
            <StepCard n={2} icon="🔗" title="Add Polygon Network" body="Bitrove runs on Polygon. MetaMask will prompt you to add Polygon automatically when you connect. Polygon has near-zero gas fees — a fraction of a cent per transaction." />
            <StepCard n={3} icon="💰" title="Add Supported Tokens" body="You will need USDT, WETH or WBTC on Polygon to buy. Use Coinbase or Independent Reserve to purchase crypto, then send to your Polygon wallet address." />
            <StepCard n={4} icon="✅" title="Click Connect Wallet" body="Hit Connect Wallet in the top right of any Bitrove page. Select your wallet and approve the connection — no signing, no fees. You are in." />
          </div>
          <div style={{ marginTop: 36 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: 16 }}>Supported Wallets</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { e: '🦊', n: 'MetaMask', t: 'RECOMMENDED' },
                { e: '🔵', n: 'Coinbase Wallet', t: null },
                { e: '🌈', n: 'Rainbow', t: null },
                { e: '🛡️', n: 'Trust Wallet', t: null },
                { e: '💳', n: 'Tangem', t: 'HARDWARE' },
                { e: '🔌', n: 'WalletConnect', t: 'COMPATIBLE' },
              ].map(({ e, n, t }) => (
                <div key={n} className="wchip">
                  <span style={{ fontSize: '1.4rem' }}>{e}</span>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>{n}</span>
                  {t && <span style={{ fontSize: '0.72rem', background: 'rgba(247,147,26,0.15)', color: '#F7931A', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>{t}</span>}
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 20, padding: '16px 22px', background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.25)', borderRadius: 10, fontSize: '0.88rem', color: '#8B8B9E', lineHeight: 1.7 }}>
            📱 <strong style={{ color: '#00D4AA' }}>Best mobile experience:</strong> Open Bitrove inside the MetaMask app for the smoothest ride. On iOS — tap the <strong style={{ color: '#fff' }}>Explore</strong> tab at the bottom of MetaMask, type <strong style={{ color: '#fff' }}>bitrove.com.au</strong> and you are in. No app switching, no popups. Our native app is on the way — stay tuned. 🚀
          </div>
        </section>

        <div style={DIV} />

        {/* SMART CONTRACT */}
        <section style={S}>
          <div style={L}>Plain English</div>
          <h2 style={H}>What is a Smart Contract?</h2>
          <p style={P}>You do not need to be technical. Here is the honest, simple version.</p>
          <div style={{ background: 'rgba(19,19,26,0.9)', border: '1px solid rgba(42,42,58,0.9)', borderRadius: 16, padding: '32px 30px', display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#F7931A', fontSize: '0.85rem', marginBottom: 10 }}>🏦 THE OLD WAY (PayPal / eBay)</div>
              <div style={{ color: '#8B8B9E', fontSize: '0.9rem', lineHeight: 1.7 }}>You send money to a company. They hold it. They decide when to release it. If they freeze your account, go bankrupt, or make a mistake — you are at their mercy. You trust the company.</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#00D4AA', fontSize: '0.85rem', marginBottom: 10 }}>⛓️ THE BITROVE WAY (Smart Contract)</div>
              <div style={{ color: '#8B8B9E', fontSize: '0.9rem', lineHeight: 1.7 }}>You send crypto to an autonomous program on the blockchain — not to us, not to the seller. The code defines every rule: when to release funds, who gets them, what happens in a dispute. Nobody can change those rules, and nobody can steal the funds. You trust the code.</div>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: '16px 22px', background: 'rgba(247,147,26,0.06)', border: '1px solid rgba(247,147,26,0.2)', borderRadius: 10, fontSize: '0.88rem', color: '#8B8B9E', lineHeight: 1.6 }}>
            🔍 <strong style={{ color: '#fff' }}>Bitrove contract is publicly verified</strong> — read every line on Polygonscan:{' '}
            <a href="https://polygonscan.com/address/0xbc9359071020025f1a13f34a48376e1cff839377" target="_blank" rel="noopener noreferrer" style={{ color: '#00D4AA', textDecoration: 'none' }}>0xbc9359...839377</a>
          </div>
        </section>

        <div style={DIV} />

        {/* HOW TO BUY */}
        <section style={S}>
          <div style={L}>Buying</div>
          <h2 style={H}>How to Buy an Item</h2>
          <p style={P}>Six simple steps. The escrow contract does the heavy lifting.</p>
          <div style={G2}>
            <StepCard n={1} icon="🔍" title="Find a Listing" body="Browse by category, search by keyword, or filter by location. All prices shown in AUD with live crypto conversion from Coinbase." />
            <StepCard n={2} icon="💬" title="Message the Seller" body="Use built-in chat to ask about the item, postage options, or meetup details. No need to share your phone number or email." />
            <StepCard n={3} icon="✅" title="Approve Token Spend" body="Click Buy Now, enter your delivery address — encrypted before storage — then approve the smart contract to access your tokens. MetaMask pops up, this is normal." />
            <StepCard n={4} icon="🔒" title="Funds Lock in Escrow" body="Your crypto goes to the smart contract, not the seller. The seller ships knowing funds are guaranteed. They cannot receive payment until you confirm receipt." />
            <StepCard n={5} icon="📦" title="Receive and Confirm" body="Item arrives? Hit Confirm Receipt in My Trades. Funds instantly release to the seller. Trade complete." />
            <StepCard n={6} icon="🚩" title="Problem? Raise a Dispute" body="Something wrong? Hit Raise Dispute before confirming. Bitrove reviews evidence from both sides. Funds stay locked until resolved." />
          </div>
        </section>

        <div style={DIV} />

        {/* ESCROW FLOW */}
        <section id="escrow" style={S}>
          <div style={L}>Escrow Explained</div>
          <h2 style={H}>Where Does the Money Go?</h2>
          <p style={P}>Your funds never touch the seller wallet until you say so. This is what makes Bitrove trustworthy.</p>
          <div className="eflow">
            <div className="enode">
              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>🛒</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>Buyer</div>
              <div style={{ fontSize: '0.73rem', color: '#8B8B9E', marginTop: 3 }}>You</div>
            </div>
            <span style={{ color: '#F7931A', fontSize: '1.4rem', padding: '0 8px', flexShrink: 0 }}>→</span>
            <div className="enode hl">
              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>⛓️</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: '#F7931A' }}>Smart Contract</div>
              <div style={{ fontSize: '0.73rem', color: '#8B8B9E', marginTop: 3 }}>Funds locked here</div>
            </div>
            <span style={{ color: '#F7931A', fontSize: '1.4rem', padding: '0 8px', flexShrink: 0 }}>→</span>
            <div className="enode">
              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>📦</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>Seller Ships</div>
              <div style={{ fontSize: '0.73rem', color: '#8B8B9E', marginTop: 3 }}>Item delivered</div>
            </div>
            <span style={{ color: '#F7931A', fontSize: '1.4rem', padding: '0 8px', flexShrink: 0 }}>→</span>
            <div className="enode">
              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>✅</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>You Confirm</div>
              <div style={{ fontSize: '0.73rem', color: '#8B8B9E', marginTop: 3 }}>Receipt confirmed</div>
            </div>
            <span style={{ color: '#F7931A', fontSize: '1.4rem', padding: '0 8px', flexShrink: 0 }}>→</span>
            <div className="enode">
              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>💸</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>Seller Paid</div>
              <div style={{ fontSize: '0.73rem', color: '#8B8B9E', marginTop: 3 }}>Instantly released</div>
            </div>
          </div>
          <div style={{ background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.25)', borderRadius: 14, padding: '28px 28px', marginTop: 20 }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#00D4AA', fontSize: '1.05rem', marginBottom: 14 }}>🔐 Bitrove 1% Fee</h3>
            <p style={{ color: '#8B8B9E', fontSize: '0.9rem', lineHeight: 1.7 }}>Bitrove charges a 1% fee on confirmed trades, automatically deducted by the smart contract. This covers platform development, dispute resolution, and hosting. No listing fees, no subscription, no hidden costs. You only pay when a trade succeeds.</p>
          </div>
        </section>

        <div style={DIV} />

        {/* HOW TO SELL */}
        <section style={S}>
          <div style={L}>Selling</div>
          <h2 style={H}>How to List an Item</h2>
          <p style={P}>Listing is free. Takes two minutes.</p>
          <div style={G2}>
            <StepCard n={1} icon="📝" title="Create Your Listing" body="Click Sell. Add a title, description, category, condition, your suburb, and set your AUD price. Live crypto equivalent is shown automatically." />
            <StepCard n={2} icon="📸" title="Add Photos" body="Upload square photos of your item. Good photos mean faster sales. Photos are stored securely in Bitrove cloud storage." />
            <StepCard n={3} icon="🚚" title="Set Delivery Type" body="Choose Postage and add a flat AUD cost or include it free, or choose Collection Only for local pickup. Buyers see this clearly before purchasing." />
            <StepCard n={4} icon="📍" title="Add Your Location" body="Enter your suburb or region so nearby buyers can find your listing. Your full address is never shown publicly." />
            <StepCard n={5} icon="🔢" title="Set Quantity" body="Selling multiples? Set quantity. Each confirmed trade decrements stock automatically. Listing marks as sold when stock hits zero." />
            <StepCard n={6} icon="⚡" title="Go Live" body="Hit Publish. Your listing is live immediately. Buyers can find it via search and category browsing. Track everything in My Trades." />
          </div>
        </section>

        <div style={DIV} />

        {/* COINS */}
        <section style={S}>
          <div style={L}>Payments</div>
          <h2 style={H}>Supported Payment Tokens</h2>
          <p style={P}>All trades settle on Polygon — fast confirmations and near-zero gas fees.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
            {[
              { i: '💵', n: 'USDT', d: 'Tether — USD stablecoin. No price volatility. Great for everyday trades.' },
              { i: '🔷', n: 'WETH', d: 'Wrapped Ether on Polygon. Bridged from Ethereum mainnet.' },
              { i: '₿', n: 'WBTC', d: 'Wrapped Bitcoin. Pay with BTC value on Polygon fast network.' },
            ].map(({ i, n, d }) => (
              <div key={n} className="coin">
                <span style={{ fontSize: '1.6rem' }}>{i}</span>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{n}</div>
                  <div style={{ fontSize: '0.78rem', color: '#8B8B9E', marginTop: 2 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '14px 20px', background: 'rgba(19,19,26,0.6)', borderRadius: 10, fontSize: '0.86rem', color: '#8B8B9E', border: '1px solid rgba(42,42,58,0.7)' }}>
            💡 <strong style={{ color: '#fff' }}>Tip for Beginners:</strong> USDT is the easiest starting point — its value matches the USD and avoids crypto price swings during the trade window.
          </div>
        </section>

        <div style={DIV} />

        {/* LOCATION */}
        <section style={S}>
          <div style={L}>Location</div>
          <h2 style={H}>Finding Local Deals</h2>
          <p style={P}>Bitrove supports location-based listings so you can trade with people nearby.</p>
          <div style={G2}>
            {[
              { icon: '📍', title: 'Suburb Visibility', body: 'Sellers add their suburb or region. This is shown publicly so buyers can assess distance before purchasing or messaging.' },
              { icon: '🔍', title: 'Filter by Location', body: 'Browse listings filtered by your state or region. Great for finding items available for local collection and avoiding postage costs.' },
              { icon: '🤝', title: 'Safe Meetups', body: 'For collection trades, meet in a public location — a busy cafe, shopping centre, or police station front car park. Always during daylight hours.' },
              { icon: '🔒', title: 'Delivery Address Privacy', body: 'When buying a postage item, your delivery address is encrypted immediately with end-to-end encryption. Only the seller of that trade can read it.' },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ display: 'flex', gap: 16, background: 'rgba(19,19,26,0.9)', border: '1px solid rgba(42,42,58,0.9)', borderRadius: 14, padding: '20px 20px' }}>
                <div style={{ fontSize: '1.6rem', flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.93rem', marginBottom: 6 }}>{title}</div>
                  <div style={{ color: '#8B8B9E', fontSize: '0.87rem', lineHeight: 1.65 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={DIV} />

        {/* CHAT */}
        <section style={S}>
          <div style={L}>Communication</div>
          <h2 style={H}>The Secure Chat System</h2>
          <p style={P}>Every listing has its own private chat between buyer and seller. No phone numbers or email addresses required.</p>
          <div style={G3}>
            {[
              { icon: '💬', title: 'Per-Listing Chat', body: 'Each conversation is tied to a specific listing and your wallet address. Clean, organised, separate from other listings.' },
              { icon: '🔏', title: 'Wallet-Gated Identity', body: 'Only wallet holders can send messages. No fake accounts, no bots — every message is tied to a real crypto wallet.' },
              { icon: '📱', title: 'Works on All Devices', body: 'Our messaging system works across desktop and mobile, all wallet types. No app download required.' },
              { icon: '🚩', title: 'Report Bad Actors', body: 'See something suspicious? Use the Report button on any listing. Bitrove reviews all reports promptly.' },
              { icon: '👀', title: 'My Chats Overview', body: 'Access all conversations from My Trades then My Chats tab. Shows listing photo and title for easy identification.' },
              { icon: '🔔', title: 'Unread Indicators', body: 'Unread message badges show when new messages are waiting. Check My Trades to stay on top of active conversations.' },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ background: 'rgba(19,19,26,0.9)', border: '1px solid rgba(42,42,58,0.9)', borderRadius: 14, padding: '20px 18px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{icon}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: 6 }}>{title}</div>
                <div style={{ color: '#8B8B9E', fontSize: '0.85rem', lineHeight: 1.65 }}>{body}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={DIV} />

        {/* SECURITY */}
        <section style={S}>
          <div style={L}>Security</div>
          <h2 style={H}>Why Bitrove is Secure</h2>
          <p style={P}>Security is not a feature — it is the foundation everything is built on.</p>
          <div style={G3}>
            <SecurityBadge icon="⛓️" title="On-Chain Escrow" body="Your funds are held by an autonomous smart contract on Polygon. No human — including Bitrove staff — can move your funds without following the contract rules." />
            <SecurityBadge icon="🔍" title="Publicly Verified Contract" body="Bitrove escrow contract is open source and verified on Polygonscan. Anyone can audit every line of code. No hidden backdoors." />
            <SecurityBadge icon="🔐" title="Encrypted Delivery Addresses" body="Delivery addresses are encrypted client-side using TweetNaCl before reaching our servers. Only the seller of that trade holds the decryption key." />
            <SecurityBadge icon="🦺" title="No Custody of Funds" body="Bitrove never holds your crypto. We are not a custodian. Tokens go directly into the smart contract, released according to trade outcome." />
            <SecurityBadge icon="🚫" title="No Account Required" body="No email means no phishing surface. No password means no password breach. Your wallet is your login — and only you control it." />
            <SecurityBadge icon="🛡️" title="Dispute Resolution" body="In any dispute, funds remain locked. Neither party can touch them. Bitrove reviews evidence and arbitrates fairly before any release." />
          </div>
        </section>

        <div style={DIV} />

        {/* SCAM WARNINGS */}
        <section style={S}>
          <div style={L}>Stay Safe</div>
          <h2 style={H}>Security Tips and Scam Warnings</h2>
          <p style={P}>The blockchain is secure. Humans are the attack surface. Here is how to stay safe.</p>
          <div style={{ background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 14, padding: '28px 28px' }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#ff4444', fontSize: '1.05rem', marginBottom: 16 }}>🚨 Bitrove Will NEVER:</h3>
            {warnings.map(({ title, detail }) => (
              <div key={title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ color: '#ff4444', fontSize: '1rem', flexShrink: 0, marginTop: 2 }}>✕</span>
                <div style={{ color: '#c0c0cc', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  <strong style={{ color: '#fff' }}>{title}.</strong> {detail}
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.25)', borderRadius: 14, padding: '28px 28px', marginTop: 16 }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#00D4AA', fontSize: '1.05rem', marginBottom: 16 }}>✅ Always Check:</h3>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {safetyTips.map(({ title, detail }) => (
                <div key={title} style={{ fontSize: '0.87rem', color: '#8B8B9E', lineHeight: 1.6 }}>
                  <strong style={{ color: '#00D4AA', display: 'block', marginBottom: 4 }}>{title}</strong>
                  {detail}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div style={DIV} />

        {/* FAQs */}
        <section style={S}>
          <div style={L}>FAQs</div>
          <h2 style={H}>Frequently Asked Questions</h2>
          <p style={P}>Still have questions? These cover the most common ones.</p>
          {faqs.map((faq, i) => (
            <Accordion key={i} q={faq.q} a={faq.a} open={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)} />
          ))}
        </section>

        <div style={DIV} />

        {/* CONTACT */}
        <section style={S}>
          <div style={L}>Support</div>
          <h2 style={H}>How to Contact Bitrove</h2>
          <p style={P}>We are a small team. We care. Response times may vary but we read everything.</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div className="ccard">
              <div style={{ fontSize: '1.6rem', marginBottom: 10 }}>📧</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: 8 }}>Email Support</div>
              <div style={{ color: '#8B8B9E', fontSize: '0.85rem', lineHeight: 1.65 }}>
                For trade disputes, account questions, or anything else:<br />
                <a href="mailto:gm@bitrove.io" style={{ color: '#00D4AA', textDecoration: 'none' }}>gm@bitrove.io</a><br /><br />
                Include your trade ID and wallet address for fastest response.
              </div>
            </div>
            <div className="ccard">
              <div style={{ fontSize: '1.6rem', marginBottom: 10 }}>🚩</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: 8 }}>Report a Listing</div>
              <div style={{ color: '#8B8B9E', fontSize: '0.85rem', lineHeight: 1.65 }}>See a scam or inappropriate listing? Use the report button directly on the listing page. We review all reports and act quickly on confirmed violations.</div>
            </div>
            <div className="ccard">
              <div style={{ fontSize: '1.6rem', marginBottom: 10 }}>⚖️</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: 8 }}>Dispute a Trade</div>
              <div style={{ color: '#8B8B9E', fontSize: '0.85rem', lineHeight: 1.65 }}>Open your Trade Detail from My Trades and hit Raise Dispute. Funds stay locked while we review. Provide photos, screenshots, and tracking numbers as evidence.</div>
            </div>
          </div>
          <div style={{ marginTop: 20, padding: '16px 22px', background: 'rgba(19,19,26,0.6)', borderRadius: 10, border: '1px solid rgba(42,42,58,0.7)', fontSize: '0.86rem', color: '#8B8B9E' }}>
            ⚠️ <strong style={{ color: '#fff' }}>Verify you are contacting real Bitrove:</strong> Official email is <strong style={{ color: '#00D4AA' }}>gm@bitrove.io</strong>. Our only websites are <strong style={{ color: '#00D4AA' }}>bitrove.com.au</strong> and <strong style={{ color: '#00D4AA' }}>bitrove.io</strong>. We have no Telegram group, Discord server, or official social media. Do not trust anyone claiming to represent Bitrove elsewhere.
          </div>
        </section>

        <div style={DIV} />

        {/* FINAL CTA */}
        <section style={{ textAlign: 'center', padding: '70px 24px' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em' }}>Ready to Trade?</div>
          <p style={{ color: '#8B8B9E', fontSize: '1rem', maxWidth: 460, margin: '0 auto 32px' }}>No KYC. No banks. Just you, your wallet, and the blockchain.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/browse" className="btn-o">Browse Listings</Link>
            <Link href="/sell" className="btn-g">Sell Something</Link>
          </div>
        </section>

        <div style={{ borderTop: '1px solid rgba(42,42,58,0.7)', textAlign: 'center', padding: '32px 24px', color: '#8B8B9E', fontSize: '0.83rem' }}>
          <span style={{ color: '#F7931A' }}>Bitrove</span> — Buy. Sell. Get paid in crypto. 🚀 &nbsp;|&nbsp; Built on Polygon &nbsp;|&nbsp;{' '}
          <a href="mailto:gm@bitrove.io" style={{ color: '#8B8B9E', textDecoration: 'none' }}>gm@bitrove.io</a>
        </div>

      </div>
    </>
  )
}
