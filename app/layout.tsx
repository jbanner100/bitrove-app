'use client'
import { polygon, mainnet } from 'wagmi/chains'
import { Inter } from 'next/font/google'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { XMTPProvider } from './contexts/XMTPContext'
import { http } from 'wagmi'

const inter = Inter({ subsets: ['latin'] })

const config = getDefaultConfig({
  appName: 'Bitrove',
  projectId: '0eb130b0b50beb76b7d9131c43f926f5',
  chains: [polygon, mainnet],
  transports: {
    [polygon.id]: http('https://polygon-mainnet.g.alchemy.com/v2/0mh3dikaN3QDHatkRQBWl'),
    [mainnet.id]: http('https://eth.llamarpc.com'),
  },
  ssr: false,
})

const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <XMTPProvider>
                {children}
              </XMTPProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}