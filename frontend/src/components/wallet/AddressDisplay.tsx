import { useState } from 'react'
import { Link } from 'react-router-dom'

function shorten(address: string) {
  if (address.length <= 14) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function AddressDisplay({
  chain,
  address,
  link = true,
}: {
  chain: string
  address: string
  link?: boolean
}) {
  const [copied, setCopied] = useState(false)

  async function copy(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const inner = (
    <span className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold" title={address}>
      {shorten(address)}
      <button
        onClick={copy}
        className="text-text-tertiary hover:text-text-primary text-xs ml-1"
        aria-label="Copy address"
      >
        {copied ? '✓' : '⧉'}
      </button>
    </span>
  )

  if (!link) return inner

  return (
    <Link to={`/wallets/${chain}/${address}`} className="text-text-primary hover:text-saffron transition-colors">
      {inner}
    </Link>
  )
}
