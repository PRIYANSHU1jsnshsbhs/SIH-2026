import clsx from 'clsx'
import chakraLoader from '@/assets/ashoka-chakra-loader.png'

type LoadingIconSize = 'button' | 'small' | 'medium' | 'large'

const SIZE_CLASSES: Record<LoadingIconSize, string> = {
  button: 'h-4 w-4',
  small: 'h-5 w-5',
  medium: 'h-8 w-8',
  large: 'h-14 w-14',
}

export function LoadingIcon({ size = 'small', className }: { size?: LoadingIconSize; className?: string }) {
  return (
    <img
      src={chakraLoader}
      alt=""
      aria-hidden="true"
      className={clsx('chakra-loading-icon shrink-0 object-contain', SIZE_CLASSES[size], className)}
    />
  )
}
