import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [
      btcAud, ethAud, usdtAud,
      btcUsd, ethUsd, usdtUsd,
      btcEur, ethEur, usdtEur,
      btcGbp, ethGbp, usdtGbp,
    ] = await Promise.all([
      fetch('https://api.coinbase.com/v2/prices/BTC-AUD/spot').then(r => r.json()),
      fetch('https://api.coinbase.com/v2/prices/ETH-AUD/spot').then(r => r.json()),
      fetch('https://api.coinbase.com/v2/prices/USDT-AUD/spot').then(r => r.json()),
      fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot').then(r => r.json()),
      fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot').then(r => r.json()),
      fetch('https://api.coinbase.com/v2/prices/USDT-USD/spot').then(r => r.json()),
      fetch('https://api.coinbase.com/v2/prices/BTC-EUR/spot').then(r => r.json()),
      fetch('https://api.coinbase.com/v2/prices/ETH-EUR/spot').then(r => r.json()),
      fetch('https://api.coinbase.com/v2/prices/USDT-EUR/spot').then(r => r.json()),
      fetch('https://api.coinbase.com/v2/prices/BTC-GBP/spot').then(r => r.json()),
      fetch('https://api.coinbase.com/v2/prices/ETH-GBP/spot').then(r => r.json()),
      fetch('https://api.coinbase.com/v2/prices/USDT-GBP/spot').then(r => r.json()),
    ])

    return NextResponse.json({
      AUD: {
        btc: parseFloat(btcAud.data.amount),
        eth: parseFloat(ethAud.data.amount),
        usdt: parseFloat(usdtAud.data.amount),
      },
      USD: {
        btc: parseFloat(btcUsd.data.amount),
        eth: parseFloat(ethUsd.data.amount),
        usdt: parseFloat(usdtUsd.data.amount),
      },
      EUR: {
        btc: parseFloat(btcEur.data.amount),
        eth: parseFloat(ethEur.data.amount),
        usdt: parseFloat(usdtEur.data.amount),
      },
      GBP: {
        btc: parseFloat(btcGbp.data.amount),
        eth: parseFloat(ethGbp.data.amount),
        usdt: parseFloat(usdtGbp.data.amount),
      },
      // Keep backward compatibility for existing code
      btc: parseFloat(btcAud.data.amount),
      eth: parseFloat(ethAud.data.amount),
      usdt: parseFloat(usdtAud.data.amount),
    })
  } catch (e) {
    console.error('Price fetch error:', e)
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 })
  }
}
