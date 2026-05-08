import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full min-h-screen items-center justify-center bg-bg-deep p-6">
          <div className="card max-w-lg p-6 text-center">
            <h1 className="mb-2 text-lg font-semibold text-ink-1">
              Something went wrong
            </h1>
            <p className="mb-4 text-sm text-ink-2">
              {this.state.error.message ?? 'Unexpected error'}
            </p>
            <button className="btn-gradient" onClick={this.reset}>
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
