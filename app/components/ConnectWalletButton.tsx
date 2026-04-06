'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useWallet } from '../hooks/useWallet'
import { useState } from 'react'

export function ConnectWalletButton() {
  const { isConnected, chain, midnightAddress, connectMidnight, disconnectMidnight, isLaceAvailable } = useWallet()
  const [showOptions, setShowOptions] = useState(false)

  // Midnight connected state
  if (chain === 'midnight') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs px-3 py-1.5 rounded-full" style={{ backgroundColor: '#1A0A2E', border: '1px solid #7B2FBE', color: '#B06FE5' }}>
          🌙 {midnightAddress?.slice(0, 16)}...
        </span>
        <button
          onClick={disconnectMidnight}
          className="text-xs px-3 py-1.5 rounded-full"
          style={{ backgroundColor: '#1A0A1A', border: '1px solid #4A1A4A', color: '#8B5A8B' }}
        >
          Disconnect
        </button>
      </div>
    )
  }

  // Both wallets available — show picker
  if (isLaceAvailable && !isConnected && showOptions) {
    return (
      <div className="flex flex-col gap-2" style={{ position: 'relative' }}>
        <div className="flex gap-2">
          {/* Polygon option — uses existing RainbowKit */}
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={() => { openConnectModal(); setShowOptions(false) }}
                className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ backgroundColor: '#1A0A2E', border: '1px solid #8247E5', color: '#9B6FE5' }}
              >
                🟣 Polygon Wallet
              </button>
            )}
          </ConnectButton.Custom>
          {/* Midnight option */}
          <button
            onClick={() => { connectMidnight(); setShowOptions(false) }}
            className="text-xs px-3 py-1.5 rounded-full font-medium"
            style={{ backgroundColor: '#1A0A2E', border: '1px solid #7B2FBE', color: '#B06FE5' }}
          >
            🌙 Lace Wallet
          </button>
        </div>
      </div>
    )
  }

  // Lace available but not shown yet, or only EVM available — show smart button
  if (isLaceAvailable && !isConnected) {
    return (
      <button
        onClick={() => setShowOptions(true)}
        className="text-sm px-4 py-2 rounded-full font-semibold"
        style={{ backgroundColor: '#F7931A', color: '#000' }}
      >
        Connect Wallet
      </button>
    )
  }

  // Default — only EVM wallets available, use existing RainbowKit button
  return (
    <ConnectButton
      accountStatus="avatar"
      chainStatus="none"
      showBalance={false}
    />
  )
}
