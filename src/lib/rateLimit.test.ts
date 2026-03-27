import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit } from './rateLimit';

// We need to reset the internal Map between tests.
// Since the module uses a module-level Map, we re-import for isolation.

describe('checkRateLimit', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	it('allows first request', () => {
		const result = checkRateLimit('1.2.3.4', '/mailbox/new');
		expect(result.allowed).toBe(true);
		expect(result.remaining).toBe(9);
	});

	it('allows up to 10 requests', () => {
		const ip = '10.0.0.1';
		for (let i = 0; i < 10; i++) {
			const result = checkRateLimit(ip, '/test');
			expect(result.allowed).toBe(true);
		}
	});

	it('rejects 11th request', () => {
		const ip = '10.0.0.2';
		for (let i = 0; i < 10; i++) {
			checkRateLimit(ip, '/test2');
		}
		const result = checkRateLimit(ip, '/test2');
		expect(result.allowed).toBe(false);
		expect(result.remaining).toBe(0);
	});

	it('isolates different IPs', () => {
		for (let i = 0; i < 10; i++) {
			checkRateLimit('10.0.0.3', '/test3');
		}
		// Different IP should still be allowed
		const result = checkRateLimit('10.0.0.4', '/test3');
		expect(result.allowed).toBe(true);
	});

	it('isolates different endpoints', () => {
		for (let i = 0; i < 10; i++) {
			checkRateLimit('10.0.0.5', '/endpointA');
		}
		// Same IP, different endpoint should still be allowed
		const result = checkRateLimit('10.0.0.5', '/endpointB');
		expect(result.allowed).toBe(true);
	});

	it('resets after window expires', () => {
		const ip = '10.0.0.6';
		for (let i = 0; i < 10; i++) {
			checkRateLimit(ip, '/test4');
		}
		expect(checkRateLimit(ip, '/test4').allowed).toBe(false);

		// Advance past the 60s window
		vi.advanceTimersByTime(61_000);

		const result = checkRateLimit(ip, '/test4');
		expect(result.allowed).toBe(true);
		expect(result.remaining).toBe(9);
	});
});
