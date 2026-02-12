import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from './use-mobile'

describe('useIsMobile', () => {
  let listeners: Array<() => void> = []

  beforeEach(() => {
    listeners = []
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: (_event: string, handler: () => void) => {
        listeners.push(handler)
      },
      removeEventListener: vi.fn(),
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  it('should return false on desktop width', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024 })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('should return true on mobile width', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500 })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('should return false at exactly 768px (breakpoint)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 768 })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('should return true at 767px (just below breakpoint)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 767 })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('should update when window resizes', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024 })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 500 })
      listeners.forEach(fn => fn())
    })

    expect(result.current).toBe(true)
  })

  it('should clean up event listener on unmount', () => {
    const removeEventListener = vi.fn()
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { unmount } = renderHook(() => useIsMobile())
    unmount()

    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
