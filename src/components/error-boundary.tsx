"use client"

import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="border border-red-500/20 rounded-lg p-6 max-w-md w-full bg-card">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-red-500 flex items-center gap-2">
                <span>⚠️</span>
                Something went wrong
              </h2>
              <p className="text-sm text-muted-foreground">
                We encountered an error while loading this page. Please try again.
              </p>
              {this.state.error && (
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto">
                  {this.state.error.message}
                </pre>
              )}
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}


