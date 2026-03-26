import nacl from 'tweetnacl'
import { encodeUTF8, decodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util'

const deriveKey = (tradeId: string, buyerAddress: string, sellerAddress: string): Uint8Array => {
  const input = `${tradeId}${buyerAddress.toLowerCase()}${sellerAddress.toLowerCase()}`
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
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
  const messageUint8 = encodeUTF8(address)
  const encrypted = nacl.secretbox(messageUint8, nonce, key)
  const fullMessage = new Uint8Array(nonce.length + encrypted.length)
  fullMessage.set(nonce)
  fullMessage.set(encrypted, nonce.length)
  return encodeBase64(fullMessage)
}

export const decryptAddress = (
  encryptedAddress: string,
  tradeId: string,
  buyerAddress: string,
  sellerAddress: string
): string => {
  try {
    const key = deriveKey(tradeId, buyerAddress, sellerAddress)
    const fullMessage = decodeBase64(encryptedAddress)
    const nonce = fullMessage.slice(0, nacl.secretbox.nonceLength)
    const message = fullMessage.slice(nacl.secretbox.nonceLength)
    const decrypted = nacl.secretbox.open(message, nonce, key)
    if (!decrypted) return '⚠ Could not decrypt address'
    return decodeUTF8(decrypted)
  } catch {
    return encryptedAddress
  }
}
