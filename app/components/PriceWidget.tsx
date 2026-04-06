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

  // currentPrice and listedTokenPrice are in AUD per token
  // isUp = token is worth MORE AUD now than when listed
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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: isUp ? 'rgba(0,212,170,0.1)' : 'rgba(255,68,68,0.1)', border: `1px solid ${isUp ? 'rgba(0,212,170,0.3)' : 'rgba(255,68,68,0.3)'}`, borderRadius: 6, padding: '2px 7px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isUp ? '#00D4AA' : '#ff4444' }}>
            {isUp ? '▲' : '▼'} {absPct}%
          </span>
        </div>
      </div>
    )
  }

  // Full chart — include listedTokenPrice in min/max so the dashed line is always visible
  const allPrices = candles.flatMap(c => [c.high, c.low])
  const minP = Math.min(...allPrices, listedTokenPrice, currentPrice)
  const maxP = Math.max(...allPrices, listedTokenPrice, currentPrice)
  // Add 5% padding so lines don't sit at very top/bottom edge
  const padding = (maxP - minP) * 0.05 || 1
  const minPadded = minP - padding
  const maxPadded = maxP + padding
  const range = maxPadded - minPadded

  const W = 340
  const H = 120
  const listedY = H - ((listedTokenPrice - minPadded) / range) * H
  const currentY = H - ((currentPrice - minPadded) / range) * H

  // Message logic:
  // isUp = BTC/ETH rose in AUD value since listing
  // If token rose: seller receives MORE AUD value (good for seller)
  // If token fell: buyer gets MORE crypto for same AUD (good for buyer)
  const upMessage = `${token} has risen ${absPct}% since listing — the item is worth more in AUD terms`
  const downMessage = `${token} has dipped ${absPct}% since listing — buyer receives more ${token} for the same AUD price`

  return (
    <div style={{ background: '#0A0A0F', border: '1px solid #2A2A3A', borderRadius: 12, padding: '14px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 }}>
        <span style={{ fontWeight: 700, color: '#8B8B9E', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
          {token} / AUD — 7 Day Hourly
        </span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: isUp ? 'rgba(0,212,170,0.1)' : 'rgba(255,68,68,0.1)', border: `1px solid ${isUp ? 'rgba(0,212,170,0.3)' : 'rgba(255,68,68,0.3)'}`, borderRadius: 6, padding: '3px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isUp ? '#00D4AA' : '#ff4444' }}>
            {isUp ? '▲' : '▼'} {absPct}% since listed
          </span>
        </div>
      </div>
      {/* Chart */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        {candles.map((c, i) => {
          const x = (i / candles.length) * W
          const candleW = Math.max(1, (W / candles.length) - 0.5)
          const yHigh = H - ((c.high - minPadded) / range) * H
          const yLow = H - ((c.low - minPadded) / range) * H
          const yOpen = H - ((c.open - minPadded) / range) * H
          const yClose = H - ((c.close - minPadded) / range) * H
          const isGreen = c.close >= c.open
          const color = isGreen ? '#00D4AA' : '#ff4444'
          return (
            <g key={i}>
              <line x1={x + candleW / 2} y1={yHigh} x2={x + candleW / 2} y2={yLow} stroke={color} strokeWidth={0.8} />
              <rect x={x} y={Math.min(yOpen, yClose)} width={candleW} height={Math.max(1, Math.abs(yClose - yOpen))} fill={color} rx={0.5} />
            </g>
          )
        })}
        {/* Listed price dashed line */}
        <line x1={0} y1={listedY} x2={W} y2={listedY} stroke="#F7931A" strokeWidth={1} strokeDasharray="4,3" />
        {/* Current price dot */}
        <circle cx={W - 4} cy={currentY} r={3} fill={isUp ? '#00D4AA' : '#ff4444'} />
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 20, height: 1, borderTop: '1px dashed #F7931A' }} />
          <span style={{ fontSize: '0.68rem', color: '#8B8B9E' }}>Price when listed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: isUp ? '#00D4AA' : '#ff4444' }} />
          <span style={{ fontSize: '0.68rem', color: '#8B8B9E' }}>Current price</span>
        </div>
      </div>
      {/* Message */}
      <div style={{ marginTop: 10, padding: '8px 12px', background: isUp ? 'rgba(0,212,170,0.06)' : 'rgba(255,68,68,0.06)', borderRadius: 8, fontSize: '0.75rem', color: isUp ? '#00D4AA' : '#ff4444', lineHeight: 1.4 }}>
        {isUp ? `📈 ${upMessage}` : `🔻 ${downMessage}`}
      </div>
    </div>
  )
}
