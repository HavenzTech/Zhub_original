import { describe, it, expect } from 'vitest'
import { sanitizeInput, containsSqlInjection, containsXss } from './sanitize'

describe('SQL Injection Protection', () => {
  describe('containsSqlInjection - detects attacks', () => {
    const attacks = [
      ["Basic OR injection", "' OR '1'='1"],
      ["OR with comment", "' OR '1'='1' --"],
      ["Double quote OR", '" OR "1"="1'],
      ["DROP TABLE", "'; DROP TABLE users; --"],
      ["UNION SELECT", "' UNION SELECT NULL, NULL --"],
      ["DELETE FROM", "'; DELETE FROM documents WHERE '1'='1"],
      ["SELECT star", "1; SELECT * FROM users"],
      ["UNION credential steal", "' AND 1=0 UNION SELECT username, password FROM users --"],
      ["Admin bypass", "admin'--"],
      ["OR 1=1", "' OR 1=1#"],
      ["Chat injection - OR", "What documents match ' OR 1=1 --"],
      ["Chat injection - DELETE", "Search for '; DELETE FROM documents WHERE '1'='1"],
      ["Chat injection - UNION", "Find projects named ' UNION SELECT * FROM users --"],
      ["Bobby Tables", "Robert'); DROP TABLE students;--"],
      ["OR string equals", "1' OR '1' = '1"],
      ["Full SELECT statement", "SELECT * FROM users WHERE id = 1"],
      ["Semicolon DROP", "test; DROP TABLE docs"],
      ["Just semicolon", "normal text with a semicolon;"],
      ["Apostrophe", "it's a test"],
      ["Comment dashes", "project -- description"],
      ["Star wildcard", "* FROM users"],
      ["Backtick", "` OR 1=1"],
      ["ALTER TABLE", "ALTER TABLE users ADD column"],
      ["TRUNCATE", "TRUNCATE TABLE documents"],
      ["EXEC command", "EXEC xp_cmdshell"],
      ["Block comment", "/* comment */ OR 1=1"],
    ]

    it.each(attacks)('blocks: %s', (_name, attack) => {
      expect(containsSqlInjection(attack)).toBe(true)
    })
  })

  describe('sanitizeInput - strips dangerous content', () => {
    const cases = [
      ["strips semicolons", "test; DROP TABLE", "test TABLE"],
      ["strips quotes", "admin'--", "admin"],
      ["strips SELECT", "SELECT * FROM users", "FROM users"],
      ["strips DELETE", "DELETE FROM docs", "FROM docs"],
      ["strips DROP", "DROP TABLE users", "TABLE users"],
      ["strips UNION", "UNION SELECT 1", "1"],
      ["strips double dashes", "value -- comment", "value comment"],
      ["strips stars", "SELECT * FROM", "FROM"],
      ["strips backticks", "`injection`", "injection"],
      ["strips block comments", "/* evil */ value", "evil / value"],
      ["strips TRUNCATE", "TRUNCATE TABLE docs", "TABLE docs"],
      ["strips ALTER", "ALTER TABLE users", "TABLE users"],
      ["strips EXEC", "EXEC xp_cmdshell", "xp_cmdshell"],
      ["cleans complex attack", "'; DROP TABLE users; --", " TABLE users "],
    ]

    it.each(cases)('%s', (_name, input, expected) => {
      const result = sanitizeInput(input)
      // Trim and normalize spaces for comparison
      expect(result.trim().replace(/\s+/g, ' ')).toBe(expected.trim().replace(/\s+/g, ' '))
    })
  })

  describe('sanitizeInput - preserves safe input', () => {
    const safeInputs = [
      "Engineering Department",
      "Q1 2024 Budget Report",
      "John Smith",
      "Project Alpha Phase 2",
      "150000.50",
      "Calgary AB T2P 1J9",
      "Meeting at 3pm tomorrow",
      "Phase 1 of 3 complete",
      "Budget is $50,000",
      "Email: john@company.com",
    ]

    it.each(safeInputs)('preserves: %s', (input) => {
      expect(sanitizeInput(input)).toBe(input)
    })
  })

  describe('containsXss - detects XSS attacks', () => {
    const xssAttacks = [
      ["Script tag", "<script>alert('xss')</script>"],
      ["Script src", "<script src='evil.js'></script>"],
      ["Self-closing script", "<script/>"],
      ["Event handler onclick", '<div onclick=alert(1)>'],
      ["Event handler onerror", '<img onerror=alert(1) src=x>'],
      ["Event handler onload", '<svg onload=alert(1)>'],
      ["Javascript URL", 'javascript:alert(1)'],
      ["Iframe injection", '<iframe src="evil.com">'],
      ["Object tag", '<object data="evil.swf">'],
      ["Embed tag", '<embed src="evil">'],
      ["Form injection", '<form action="evil.com">'],
      ["Expression CSS", 'expression(alert(1))'],
      ["CSS url", 'url(javascript:alert(1))'],
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
    it('strips event handlers', () => {
      const result = sanitizeInput('<img onerror=alert(1) src=x>')
      expect(result).not.toContain('onerror')
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

  describe('containsSqlInjection - no false positives on safe input', () => {
    const safeInputs = [
      "Engineering Department",
      "Q1 2024 Budget Report",
      "John Smith",
      "Project Alpha Phase 2",
      "150000.50",
      "Calgary AB T2P 1J9",
    ]

    it.each(safeInputs)('allows: %s', (input) => {
      expect(containsSqlInjection(input)).toBe(false)
    })
  })
})
