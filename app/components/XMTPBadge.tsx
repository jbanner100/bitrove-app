// ── XMTP Unread Badge (app/components/XMTPBadge.tsx) ─────────────
'use client'

import { useXMTP } from '../contexts/XMTPContext'

export default function XMTPBadge() {
  const { unreadCount } = useXMTP()

  if (unreadCount === 0) return null

  return (
    <a href="/trades" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 20 }}>💬</span>
      <span style={{
        position: 'absolute', top: -6, right: -6,
        backgroundColor: '#F7931A', color: '#fff',
        borderRadius: '50%', width: 18, height: 18,
        fontSize: 11, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {unreadCount}
      </span>
    </a>
  )
}
