import { describe, it, expect } from 'vitest';
import { generateRecoveryCode, formatRecoveryCode } from './recovery-code';

const VALID_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

describe('generateRecoveryCode', () => {
  it('returns format XXXX-XXXX-XXXX', () => {
    const code = generateRecoveryCode();
    expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  it('only uses safe charset (no O/I/L/0/1)', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateRecoveryCode().replace(/-/g, '');
      for (const c of code) {
        expect(VALID_CHARS).toContain(c);
      }
    }
  });

  it('generates unique codes', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateRecoveryCode()));
    expect(codes.size).toBe(100);
  });
});

describe('formatRecoveryCode', () => {
  it('uppercases input', () => {
    expect(formatRecoveryCode('k9x2mf7apq3d')).toBe('K9X2-MF7A-PQ3D');
  });

  it('strips spaces', () => {
    expect(formatRecoveryCode('K9X2 MF7A PQ3D')).toBe('K9X2-MF7A-PQ3D');
  });

  it('strips existing dashes and re-formats', () => {
    expect(formatRecoveryCode('K9X2-MF7A-PQ3D')).toBe('K9X2-MF7A-PQ3D');
  });

  it('handles partial input', () => {
    expect(formatRecoveryCode('K9X2')).toBe('K9X2');
  });
});
