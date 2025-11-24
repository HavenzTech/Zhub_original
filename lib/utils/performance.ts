/**
 * Performance monitoring utilities for tracking render times, API calls, and user interactions
 */

import React from 'react'

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private marks: Map<string, number> = new Map()
  private enabled: boolean = process.env.NODE_ENV === 'development'

  /**
   * Start a performance measurement
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return

    const markName = `${name}-start`
    this.marks.set(markName, performance.now())

    if (metadata) {
      this.marks.set(`${markName}-metadata`, metadata as any)
    }
  }

  /**
   * End a performance measurement and record the metric
   */
  end(name: string, additionalMetadata?: Record<string, any>): number | null {
    if (!this.enabled) return null

    const markName = `${name}-start`
    const startTime = this.marks.get(markName)

    if (!startTime) {
      console.warn(`Performance mark "${name}" not found. Did you call start()?`)
      return null
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    // Get stored metadata if any
    const storedMetadata = this.marks.get(`${markName}-metadata`) as Record<string, any> | undefined
    const metadata = { ...(storedMetadata || {}), ...(additionalMetadata || {}) }

    // Record the metric
    this.metrics.push({
      name,
      value: duration,
      timestamp: Date.now(),
      metadata,
    })

    // Clean up marks
    this.marks.delete(markName)
    this.marks.delete(`${markName}-metadata`)

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`, metadata || '')
    }

    return duration
  }

  /**
   * Measure a function execution time
   */
  async measure<T>(
    name: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata)
    try {
      const result = await fn()
      this.end(name)
      return result
    } catch (error) {
      this.end(name, { error: true })
      throw error
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Get metrics filtered by name pattern
   */
  getMetricsByName(namePattern: string | RegExp): PerformanceMetric[] {
    const pattern = typeof namePattern === 'string'
      ? new RegExp(namePattern)
      : namePattern

    return this.metrics.filter(m => pattern.test(m.name))
  }

  /**
   * Get average duration for a metric name
   */
  getAverage(name: string): number {
    const metrics = this.metrics.filter(m => m.name === name)
    if (metrics.length === 0) return 0

    const sum = metrics.reduce((acc, m) => acc + m.value, 0)
    return sum / metrics.length
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
    this.marks.clear()
  }

  /**
   * Enable or disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Get performance summary report
   */
  getSummary(): {
    total: number
    byName: Record<string, { count: number; avg: number; min: number; max: number }>
  } {
    const byName: Record<string, { count: number; avg: number; min: number; max: number }> = {}

    for (const metric of this.metrics) {
      if (!byName[metric.name]) {
        byName[metric.name] = {
          count: 0,
          avg: 0,
          min: Infinity,
          max: -Infinity,
        }
      }

      const stats = byName[metric.name]
      stats.count++
      stats.min = Math.min(stats.min, metric.value)
      stats.max = Math.max(stats.max, metric.value)
    }

    // Calculate averages
    for (const name in byName) {
      const metrics = this.metrics.filter(m => m.name === name)
      const sum = metrics.reduce((acc, m) => acc + m.value, 0)
      byName[name].avg = sum / metrics.length
    }

    return {
      total: this.metrics.length,
      byName,
    }
  }

  /**
   * Export metrics as JSON
   */
  exportJSON(): string {
    return JSON.stringify({
      metrics: this.metrics,
      summary: this.getSummary(),
      timestamp: Date.now(),
    }, null, 2)
  }

  /**
   * Record a metric directly (useful for external measurements)
   */
  record(name: string, value: number, metadata?: Record<string, any>): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata,
    })
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * Decorator function to measure component render time
 */
export function measureRender(componentName: string) {
  return function <T extends React.ComponentType<any>>(Component: T): T {
    const MeasuredComponent = (props: any) => {
      performanceMonitor.start(`${componentName}-render`)

      React.useEffect(() => {
        performanceMonitor.end(`${componentName}-render`)
      })

      return React.createElement(Component, props)
    }

    MeasuredComponent.displayName = `Measured(${componentName})`
    return MeasuredComponent as T
  }
}

/**
 * Hook to measure component lifecycle
 */
export function usePerformanceMonitor(componentName: string, enabled: boolean = true) {
  const renderCountRef = React.useRef(0)

  React.useEffect(() => {
    if (!enabled) return

    renderCountRef.current++
    const renderCount = renderCountRef.current

    performanceMonitor.start(`${componentName}-mount`)

    return () => {
      performanceMonitor.end(`${componentName}-unmount`, { renderCount })
    }
  }, [componentName, enabled])

  React.useEffect(() => {
    if (!enabled) return
    performanceMonitor.end(`${componentName}-mount`)
  })
}

/**
 * Measure API call duration
 */
export async function measureApiCall<T>(
  endpoint: string,
  apiCall: () => Promise<T>
): Promise<T> {
  return performanceMonitor.measure(`api:${endpoint}`, apiCall, { endpoint })
}

/**
 * Report Core Web Vitals
 */
export function reportWebVitals(metric: any) {
  if (performanceMonitor.isEnabled()) {
    performanceMonitor.record(`web-vital:${metric.name}`, metric.value, {
      id: metric.id,
      rating: metric.rating,
    })

    console.log(`📊 ${metric.name}:`, metric)
  }
}

// Export types
export type { PerformanceMetric }
