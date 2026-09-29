import clsx from 'clsx'
import lapusLogo from '@/assets/lapus-logo.png'

interface BrandLogoProps {
  className?: string
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <img
      src={lapusLogo}
      alt="LAPUS"
      className={clsx('block object-contain', className)}
    />
  )
}
