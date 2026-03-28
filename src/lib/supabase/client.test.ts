import { describe, it, expect, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
	env: {
		SUPABASE_ANON_KEY: 'test-anon-key',
		SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
	},
}));

import { validateId } from './client';

describe('validateId', () => {
	it('accepts valid 8-char lowercase hex string', () => {
		expect(validateId('a3f8c012')).toBe(true);
	});

	it('accepts all zeros', () => {
		expect(validateId('00000000')).toBe(true);
	});

	it('rejects empty string', () => {
		expect(validateId('')).toBe(false);
	});

	it('rejects too short', () => {
		expect(validateId('a3f8c01')).toBe(false);
	});

	it('rejects uppercase characters', () => {
		expect(validateId('A3F8C012')).toBe(false);
	});

	it('rejects too long', () => {
		expect(validateId('a3f8c0123')).toBe(false);
	});
});
