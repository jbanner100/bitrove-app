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

  if (compact) {
    const sparkCandles = candles.slice(-24)
    const allPrices = sparkCandles.flatMap(c => [c.high, c.low])
    const minP = Math.min(...allPrices)
    const maxP = Math.max(...allPrices)
    const range = maxP - minP || 1
    const w = 60
    const h = 28

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width={w} height={h} style={{ display: 'block' }}>
          {sparkCandles.map((c, i) => {
            const x = (i / sparkCandles.length) * w
            const candleW = Math.max(1.5, (w / sparkCandles.length) - 1)
            const yHigh = h - ((c.high - minP) / range) * h
            const yLow = h - ((c.low - minP) / range) * h
            const yOpen = h - ((c.open - minP) / range) * h
            const yClose = h - ((c.close - minP) / range) * h
            const isGreen = c.close >= c.open
            const color = isGreen ? '#00D4AA' : '#ff4444'
            return (
              <g key={i}>
                <line x1={x + candleW / 2} y1={yHigh} x2={x + candleW / 2} y2={yLow} stroke={color} strokeWidth={0.8} />
                <rect x={x} y={Math.min(yOpen, yClose)} width={candleW} height={Math.max(1, Math.abs(yClose - yOpen))} fill={color} />
              </g>
            )
          })}
          <line
            x1={0} y1={h - ((listedTokenPrice - minP) / range) * h}
            x2={w} y2={h - ((listedTokenPrice - minP) / range) * h}
            stroke="#F7931A" strokeWidth={0.8} strokeDasharray="2,2"
          />
        </svg>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: isUp ? 'rgba(255,68,68,0.1)' : 'rgba(0,212,170,0.1)', border: `1px solid ${isUp ? 'rgba(255,68,68,0.3)' : 'rgba(0,212,170,0.3)'}`, borderRadius: 6, padding: '2px 7px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isUp ? '#ff4444' : '#00D4AA' }}>
            {isUp ? '▲' : '▼'} {absPct}%
          </span>
        </div>
      </div>
    )
  }

  const allPrices = candles.flatMap(c => [c.high, c.low])
  const minP = Math.min(...allPrices, listedTokenPrice)
  const maxP = Math.max(...allPrices, listedTokenPrice)
  const range = maxP - minP || 1
  const W = 340
  const H = 120
  const listedY = H - ((listedTokenPrice - minP) / range) * H
  const currentY = H - ((currentPrice - minP) / range) * H

  return (
    <div style={{ background: '#0A0A0F', border: '1px solid #2A2A3A', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#8B8B9E', fontSize: '0.78rem' }}>
          {token === 'BTC' ? 'BTC' : 'ETH'} / AUD — 7 Day Hourly
        </span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: isUp ? 'rgba(255,68,68,0.1)' : 'rgba(0,212,170,0.1)', border: `1px solid ${isUp ? 'rgba(255,68,68,0.3)' : 'rgba(0,212,170,0.3)'}`, borderRadius: 6, padding: '3px 10px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isUp ? '#ff4444' : '#00D4AA' }}>
            {isUp ? '▲' : '▼'} {absPct}% since listed
          </span>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        {candles.map((c, i) => {
          const x = (i / candles.length) * W
          const candleW = Math.max(1, (W / candles.length) - 0.5)
          const yHigh = H - ((c.high - minP) / range) * H
          const yLow = H - ((c.low - minP) / range) * H
          const yOpen = H - ((c.open - minP) / range) * H
          const yClose = H - ((c.close - minP) / range) * H
          const isGreen = c.close >= c.open
          const color = isGreen ? '#00D4AA' : '#ff4444'
          return (
            <g key={i}>
              <line x1={x + candleW / 2} y1={yHigh} x2={x + candleW / 2} y2={yLow} stroke={color} strokeWidth={0.8} />
              <rect x={x} y={Math.min(yOpen, yClose)} width={candleW} height={Math.max(1, Math.abs(yClose - yOpen))} fill={color} rx={0.5} />
            </g>
          )
        })}
        <line x1={0} y1={listedY} x2={W} y2={listedY} stroke="#F7931A" strokeWidth={1} strokeDasharray="4,3" />
        <text x={4} y={listedY - 4} fill="#F7931A" fontSize={8} fontWeight="600">Listed</text>
        <circle cx={W - 4} cy={currentY} r={3} fill={isUp ? '#ff4444' : '#00D4AA'} />
        <text x={W - 8} y={currentY - 6} fill={isUp ? '#ff4444' : '#00D4AA'} fontSize={8} textAnchor="end" fontWeight="600">Now</text>
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 20, height: 1, borderTop: '1px dashed #F7931A' }} />
          <span style={{ fontSize: '0.68rem', color: '#8B8B9E' }}>Price when listed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: isUp ? '#ff4444' : '#00D4AA' }} />
          <span style={{ fontSize: '0.68rem', color: '#8B8B9E' }}>Current price</span>
        </div>
      </div>
      {isUp ? (
        <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(255,68,68,0.06)', borderRadius: 8, fontSize: '0.78rem', color: '#ff4444' }}>
          📈 {token === 'BTC' ? 'BTC' : 'ETH'} has risen since listing — seller is getting more value than listed price
        </div>
      ) : (
        <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(0,212,170,0.06)', borderRadius: 8, fontSize: '0.78rem', color: '#00D4AA' }}>
          🔥 {token === 'BTC' ? 'BTC' : 'ETH'} dipped since listing — buyer gets more crypto for the same AUD price
        </div>
      )}
    </div>
  )
}
