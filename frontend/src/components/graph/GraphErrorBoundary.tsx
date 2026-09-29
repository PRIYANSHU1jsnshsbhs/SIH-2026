import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class GraphErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Graph rendering error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center rounded-lg bg-surface-1 border border-border-c">
          <p className="text-sm font-medium text-text-secondary">Unable to render graph preview.</p>
        </div>
      )
    }

    return this.props.children
  }
}
