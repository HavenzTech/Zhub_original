import { describe, it, expect } from 'vitest'
import { sanitizeInput, containsXss } from './sanitize'

describe('XSS Protection', () => {
  describe('containsXss - detects XSS attacks', () => {
    const xssAttacks = [
      ["Script tag", "<script>alert('xss')</script>"],
      ["Script src", "<script src='evil.js'></script>"],
      ["Self-closing script", "<script/>"],
      ["Javascript URL", 'javascript:alert(1)'],
      ["Iframe injection", '<iframe src="evil.com">'],
      ["Object tag", '<object data="evil.swf">'],
      ["Embed tag", '<embed src="evil">'],
    ]

    it.each(xssAttacks)('blocks: %s', (_name, attack) => {
      expect(containsXss(attack)).toBe(true)
    })
  })

  describe('sanitizeInput - strips XSS content', () => {
    it('strips script tags completely', () => {
      const result = sanitizeInput("<script>alert('xss')</script>")
      expect(result).not.toContain('<script')
      expect(result).not.toContain('</script')
    })
    it('strips javascript: URLs', () => {
      const result = sanitizeInput('javascript:alert(1)')
      expect(result).not.toContain('javascript:')
    })
    it('strips iframe tags', () => {
      const result = sanitizeInput('<iframe src="evil.com">')
      expect(result).not.toContain('<iframe')
    })
    it('strips embed tags', () => {
      const result = sanitizeInput('<embed src="evil.swf">')
      expect(result).not.toContain('<embed')
    })
  })

  describe('sanitizeInput - preserves normal user input', () => {
    const safeInputs = [
      "I updated the report",
      "Please select the correct version",
      "We need to delete the old draft",
      "Create a new folder for Q1",
      "John's project is complete",
      "Budget is $50,000; approved by CEO",
      "Engineering Department",
      "Q1 2024 Budget Report",
      "Drop off the documents at reception",
      "The table shows revenue data",
      "Insert the new page after section 3",
      "Execute the plan by Friday",
      "Or we could try a different approach",
      "Email: john@company.com",
    ]

    it.each(safeInputs)('preserves: %s', (input) => {
      expect(sanitizeInput(input)).toBe(input)
    })
  })
})
