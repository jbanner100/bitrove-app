import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [btcRes, ethRes, usdtRes, forexRes] = await Promise.all([
      fetch('https://api.coinbase.com/v2/prices/BTC-AUD/spot'),
      fetch('https://api.coinbase.com/v2/prices/ETH-AUD/spot'),
      fetch('https://api.coinbase.com/v2/prices/USDT-AUD/spot'),
      fetch('https://open.er-api.com/v6/latest/USD'),
    ])

    const [btcData, ethData, usdtData, forexData] = await Promise.all([
      btcRes.json(),
      ethRes.json(),
      usdtRes.json(),
      forexRes.json(),
    ])

    return NextResponse.json({
      btc: parseFloat(btcData.data.amount),
      eth: parseFloat(ethData.data.amount),
      usdt: parseFloat(usdtData.data.amount),
    })
  } catch (e) {
    console.error('Price fetch error:', e)
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 })
  }
}