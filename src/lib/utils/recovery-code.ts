const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateRecoveryCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const chars = Array.from(bytes, (b) => CHARSET[b % CHARSET.length]);
  return `${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}-${chars.slice(8, 12).join('')}`;
}

export function formatRecoveryCode(input: string): string {
  const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (clean.length <= 4) {
    return clean;
  }

  if (clean.length <= 8) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  }

  return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8)}`;
}
