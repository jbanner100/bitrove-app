import nacl from 'tweetnacl'

const deriveKey = (tradeId: string, buyerAddress: string, sellerAddress: string): Uint8Array => {
  const input = `${tradeId}${buyerAddress.toLowerCase()}${sellerAddress.toLowerCase()}`
  const data = new TextEncoder().encode(input)
  const key = new Uint8Array(32)
  for (let i = 0; i < data.length; i++) {
    key[i % 32] ^= data[i]
  }
  return key
}

export const encryptAddress = (
  address: string,
  tradeId: string,
  buyerAddress: string,
  sellerAddress: string
): string => {
  const key = deriveKey(tradeId, buyerAddress, sellerAddress)
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
  const messageUint8 = new TextEncoder().encode(address)
  const encrypted = nacl.secretbox(messageUint8, nonce, key)
  const fullMessage = new Uint8Array(nonce.length + encrypted.length)
  fullMessage.set(nonce)
  fullMessage.set(encrypted, nonce.length)
  return Buffer.from(fullMessage).toString('base64')
}

export const decryptAddress = (
  encryptedAddress: string,
  tradeId: string,
  buyerAddress: string,
  sellerAddress: string
): string => {
  try {
    const key = deriveKey(tradeId, buyerAddress, sellerAddress)
    const fullMessage = new Uint8Array(Buffer.from(encryptedAddress, 'base64'))
    const nonce = fullMessage.slice(0, nacl.secretbox.nonceLength)
    const message = fullMessage.slice(nacl.secretbox.nonceLength)
    const decrypted = nacl.secretbox.open(message, nonce, key)
    if (!decrypted) return '⚠ Could not decrypt address'
    return new TextDecoder().decode(decrypted)
  } catch {
    return encryptedAddress
  }
}
