import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getQuickActions,
  getRelevanceScoreColor,
  formatMessageTimestamp,
  generateSessionId,
  getMessageRoleName,
  getMessageRoleColor,
  getMessageAvatarBg,
  getMessageContentBg,
} from './chatHelpers'

describe('chatHelpers', () => {
  describe('getQuickActions', () => {
    it('should return 4 quick actions', () => {
      const actions = getQuickActions()
      expect(actions).toHaveLength(4)
    })

    it('should have title, description, icon, and prompt for each action', () => {
      const actions = getQuickActions()
      for (const action of actions) {
        expect(action.title).toBeTruthy()
        expect(action.description).toBeTruthy()
        expect(action.icon).toBeDefined()
        expect(action.prompt).toBeTruthy()
      }
    })

    it('should include Company Analysis', () => {
      const actions = getQuickActions()
      expect(actions.some(a => a.title === 'Company Analysis')).toBe(true)
    })

    it('should include Document Search', () => {
      const actions = getQuickActions()
      expect(actions.some(a => a.title === 'Document Search')).toBe(true)
    })
  })

  describe('getRelevanceScoreColor', () => {
    it('should return emerald for high score (>= 80)', () => {
      expect(getRelevanceScoreColor(80)).toContain('emerald')
      expect(getRelevanceScoreColor(100)).toContain('emerald')
      expect(getRelevanceScoreColor(95)).toContain('emerald')
    })

    it('should return yellow for medium score (60-79)', () => {
      expect(getRelevanceScoreColor(60)).toContain('yellow')
      expect(getRelevanceScoreColor(79)).toContain('yellow')
    })

    it('should return red for low score (< 60)', () => {
      expect(getRelevanceScoreColor(59)).toContain('red')
      expect(getRelevanceScoreColor(0)).toContain('red')
      expect(getRelevanceScoreColor(30)).toContain('red')
    })
  })

  describe('formatMessageTimestamp', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 0, 15, 14, 30, 0))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return a formatted time string', () => {
      const result = formatMessageTimestamp()
      // Should contain hour and minute
      expect(result).toMatch(/\d{1,2}:\d{2}/)
    })
  })

  describe('generateSessionId', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 0, 15))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should generate a session ID with email and date', () => {
      const id = generateSessionId('user@test.com')
      expect(id).toBe('session_user@test.com_2025-01-15')
    })

    it('should generate different IDs for different emails', () => {
      const id1 = generateSessionId('alice@test.com')
      const id2 = generateSessionId('bob@test.com')
      expect(id1).not.toBe(id2)
    })
  })

  describe('getMessageRoleName', () => {
    it('should return "You" for user', () => {
      expect(getMessageRoleName('user')).toBe('You')
    })

    it('should return "Z AI (Internal)" for internal-z', () => {
      expect(getMessageRoleName('internal-z')).toBe('Z AI (Internal)')
    })

    it('should return "Z AI (External)" for external-z', () => {
      expect(getMessageRoleName('external-z')).toBe('Z AI (External)')
    })
  })

  describe('getMessageRoleColor', () => {
    it('should return stone for user', () => {
      expect(getMessageRoleColor('user')).toContain('stone')
    })

    it('should return cyan for internal-z', () => {
      expect(getMessageRoleColor('internal-z')).toContain('accent-cyan')
    })

    it('should return violet for external-z', () => {
      expect(getMessageRoleColor('external-z')).toContain('violet')
    })
  })

  describe('getMessageAvatarBg', () => {
    it('should return stone for user', () => {
      expect(getMessageAvatarBg('user')).toContain('stone')
    })

    it('should return cyan for internal-z', () => {
      expect(getMessageAvatarBg('internal-z')).toContain('accent-cyan')
    })

    it('should return violet for external-z', () => {
      expect(getMessageAvatarBg('external-z')).toContain('violet')
    })
  })

  describe('getMessageContentBg', () => {
    it('should return stone-50 bg for user', () => {
      expect(getMessageContentBg('user')).toContain('stone-50')
    })

    it('should return white bg for internal-z', () => {
      expect(getMessageContentBg('internal-z')).toContain('bg-white')
    })

    it('should return white bg for external-z', () => {
      expect(getMessageContentBg('external-z')).toContain('bg-white')
    })
  })
})
