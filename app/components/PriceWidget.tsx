'use client'

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
}

interface Props {
  token: string
  listedTokenPrice: number | null
  currentPrice: number | null
  candles: Candle[]
  compact?: boolean
}

export default function PriceWidget({ token, listedTokenPrice, currentPrice, candles, compact = false }: Props) {
  if (token === 'USDT') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.3)', borderRadius: 6, padding: '3px 10px' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#00D4AA' }}>◈ USDT Stable</span>
      </div>
    )
  }

  if (!listedTokenPrice || candles.length === 0 || !currentPrice) return null

  const pctChange = ((currentPrice - listedTokenPrice) / listedTokenPrice) * 100
  const isUp = pctChange >= 0
  const absPct = Math.abs(pctChange).toFixed(2)

  // Compact sparkline — simple line, no candles
  if (compact) {
    const closes = candles.slice(-24).map(c => c.close)
    const minP = Math.min(...closes)
    const maxP = Math.max(...closes)
    const range = maxP - minP || 1
    const w = 60
    const h = 28
    const points = closes.map((p, i) => {
      const x = (i / (closes.length - 1)) * w
      const y = h - ((p - minP) / range) * h
      return `${x},${y}`
    }).join(' ')

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width={w} height={h} style={{ display: 'block' }}>
          <polyline points={points} fill="none" stroke={isUp ? '#00D4AA' : '#ff4444'} strokeWidth={1.5} />
        </svg>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: isUp ? 'rgba(0,212,170,0.1)' : 'rgba(255,68,68,0.1)', border: `1px solid ${isUp ? 'rgba(0,212,170,0.3)' : 'rgba(255,68,68,0.3)'}`, borderRadius: 6, padding: '2px 7px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isUp ? '#00D4AA' : '#ff4444' }}>
            {isUp ? '▲' : '▼'} {absPct}%
          </span>
        </div>
      </div>
    )
  }

  // Full line chart
  const closes = candles.map(c => c.close)
  const allPrices = [...closes, listedTokenPrice, currentPrice]
  const minP = Math.min(...allPrices)
  const maxP = Math.max(...allPrices)
  const padding = (maxP - minP) * 0.08 || 100
  const minPadded = minP - padding
  const maxPadded = maxP + padding
  const range = maxPadded - minPadded

  const W = 340
  const H = 100

  const toY = (p: number) => H - ((p - minPadded) / range) * H
  const toX = (i: number) => (i / (closes.length - 1)) * W

  const linePoints = closes.map((p, i) => `${toX(i)},${toY(p)}`).join(' ')
  const listedY = toY(listedTokenPrice)
  const currentY = toY(currentPrice)

  // Dynamic AUD value of the item
  // item was listed at: listedTokenPrice AUD per token
  // cryptoAmount = aud_price / listedTokenPrice (fixed)
  // current AUD value = cryptoAmount * currentPrice
  // But we don't have aud_price here — just show % change and direction

  const upMessage = `${token} is up ${absPct}% since listing — the item's AUD value has increased`
  const downMessage = `${token} is down ${absPct}% since listing — the item's AUD value has decreased`

  return (
    <div style={{ background: '#0A0A0F', border: '1px solid #2A2A3A', borderRadius: 12, padding: '14px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 }}>
        <span style={{ fontWeight: 700, color: '#8B8B9E', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
          {token} / AUD — 7 Day
        </span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: isUp ? 'rgba(0,212,170,0.1)' : 'rgba(255,68,68,0.1)', border: `1px solid ${isUp ? 'rgba(0,212,170,0.3)' : 'rgba(255,68,68,0.3)'}`, borderRadius: 6, padding: '3px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isUp ? '#00D4AA' : '#ff4444' }}>
            {isUp ? '▲' : '▼'} {absPct}% since listed
          </span>
        </div>
      </div>

      {/* Line chart */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        {/* Listed price horizontal line */}
        <line x1={0} y1={listedY} x2={W} y2={listedY} stroke="#F7931A" strokeWidth={1} strokeDasharray="5,3" opacity={0.8} />
        {/* Price line */}
        <polyline points={linePoints} fill="none" stroke='#8B5CF6' strokeWidth={1.5} strokeLinejoin="round" />
        {/* Current price dot */}
        <circle cx={W} cy={currentY} r={3.5} fill="#FFFFFF" />
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 20, height: 1, borderTop: '1px dashed #F7931A' }} />
          <span style={{ fontSize: '0.68rem', color: '#8B8B9E' }}>Listed at {token} ${listedTokenPrice?.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFFFFF' }} />
          <span style={{ fontSize: '0.68rem', color: '#8B8B9E' }}>Now ${currentPrice?.toLocaleString()}</span>
        </div>
      </div>

      {/* Message */}
      <div style={{ marginTop: 10, padding: '8px 12px', background: isUp ? 'rgba(0,212,170,0.06)' : 'rgba(255,68,68,0.06)', borderRadius: 8, fontSize: '0.75rem', color: isUp ? '#00D4AA' : '#ff4444', lineHeight: 1.4 }}>
        {isUp ? `📈 ${upMessage}` : `🔻 ${downMessage}`}
      </div>
    </div>
  )
}
