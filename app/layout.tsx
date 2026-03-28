'use client'
import { polygon, mainnet } from 'wagmi/chains'
import { Inter } from 'next/font/google'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { XMTPProvider, useXMTP } from './contexts/XMTPContext'
import { useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { Analytics } from '@vercel/analytics/react'
import { http, fallback } from 'wagmi'

const inter = Inter({ subsets: ['latin'] })

const config = getDefaultConfig({
  appName: 'Bitrove',
  projectId: '0eb130b0b50beb76b7d9131c43f926f5',
  chains: [polygon, mainnet],
  transports: {
    [polygon.id]: fallback([
      http('https://polygon-mainnet.g.alchemy.com/v2/0mh3dikaN3QDHatkRQBWl'),
      http('https://polygon-rpc.com'),
    ]),
    [mainnet.id]: http('https://ethereum.publicnode.com'),
  },
  pollingInterval: 30_000,
  ssr: false,
})

const queryClient = new QueryClient()

function XMTPConnector({ children }: { children: React.ReactNode }) {
  const { initXMTP } = useXMTP()
  const { isConnected } = useAccount()
  const prevConnected = useRef(false)

  useEffect(() => {
    if (isConnected && !prevConnected.current) {
      prevConnected.current = true
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
      const delay = isMobile ? 2500 : 500
      setTimeout(() => {
        initXMTP().catch(() => {})
      }, delay)
    }
    if (!isConnected) {
      prevConnected.current = false
    }
  }, [isConnected, initXMTP])

  return <>{children}</>
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
      </head>
      <body className={inter.className}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider modalSize="compact">
              <XMTPProvider>
                <XMTPConnector>
                  {children}
                  <Analytics />
                </XMTPConnector>
              </XMTPProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}
