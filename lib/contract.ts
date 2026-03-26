import BitroveEscrowABI from './BitroveEscrow.json'

export const CONTRACT_ADDRESS = '0xbc9359071020025f1a13f34a48376e1cff839377' as `0x${string}`

export const CONTRACT_ABI = BitroveEscrowABI.abi

// Polygon mainnet token addresses
export const TOKENS = {
  USDT: {
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as `0x${string}`,
    decimals: 6,
    symbol: 'USDT',
  },
  WETH: {
    address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619' as `0x${string}`,
    decimals: 18,
    symbol: 'WETH',
  },
  WBTC: {
    address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6' as `0x${string}`,
    decimals: 8,
    symbol: 'WBTC',
  },
}

// Minimal ERC20 ABI for approve and allowance
export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const