import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({
	supabaseFetch: vi.fn(),
	serviceRoleFetch: vi.fn(),
}));

vi.mock('$lib/utils/recovery-code', () => ({
	formatRecoveryCode: vi.fn((code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/(.{4})(.{4})(.+)/, '$1-$2-$3')),
}));

import { supabaseFetch, serviceRoleFetch } from './client';
import { getKennel, getKennelByRecoveryCode, updateKennel, createKennel } from './kennels';

const mockSupabaseFetch = vi.mocked(supabaseFetch);
const mockServiceRoleFetch = vi.mocked(serviceRoleFetch);

const sampleKennel = {
	id: 'abc12345',
	recovery_code: 'ABCD-EFGH-JKLM',
	mailbox_id: 'mail1234',
	mbti: 'INTJ',
	ai_type: 'deepseek',
	dog_id: 'googler',
	quip: 'test quip',
	locale: 'en',
	test_count: 1,
	created_at: '2026-01-01T00:00:00.000Z',
	updated_at: '2026-01-01T00:00:00.000Z',
};

describe('getKennel', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns kennel when found', async () => {
		mockSupabaseFetch.mockResolvedValue([sampleKennel]);
		const result = await getKennel('abc12345');
		expect(result).toEqual(sampleKennel);
		expect(mockSupabaseFetch).toHaveBeenCalledWith('kennels?id=eq.abc12345&select=*');
	});

	it('returns null when not found', async () => {
		mockSupabaseFetch.mockResolvedValue([]);
		const result = await getKennel('notfound');
		expect(result).toBeNull();
	});

	it('returns null when response is null', async () => {
		mockSupabaseFetch.mockResolvedValue(null);
		const result = await getKennel('notfound');
		expect(result).toBeNull();
	});
});

describe('getKennelByRecoveryCode', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns kennel when code matches', async () => {
		mockSupabaseFetch.mockResolvedValue([sampleKennel]);
		const result = await getKennelByRecoveryCode('abcdefghjklm');
		expect(result).toEqual(sampleKennel);
		expect(mockSupabaseFetch).toHaveBeenCalledWith(
			expect.stringContaining('kennels?recovery_code=eq.')
		);
	});

	it('returns null when code does not match', async () => {
		mockSupabaseFetch.mockResolvedValue([]);
		const result = await getKennelByRecoveryCode('XXXX-YYYY-ZZZZ');
		expect(result).toBeNull();
	});
});

describe('updateKennel', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns false when kennel not found', async () => {
		mockSupabaseFetch.mockResolvedValue([]);
		const result = await updateKennel('notfound', {
			mbti: 'ENFP',
			aiType: 'deepseek',
			dogId: 'googler',
			quip: null,
		});
		expect(result).toBe(false);
		expect(mockServiceRoleFetch).not.toHaveBeenCalled();
	});

	it('updates kennel and increments test_count', async () => {
		mockSupabaseFetch.mockResolvedValue([sampleKennel]);
		mockServiceRoleFetch.mockResolvedValue(null);
		const result = await updateKennel('abc12345', {
			mbti: 'ENFP',
			aiType: 'claude',
			dogId: 'doge',
			quip: 'new quip',
		});
		expect(result).toBe(true);
		expect(mockServiceRoleFetch).toHaveBeenCalledWith(
			'kennels?id=eq.abc12345',
			expect.objectContaining({
				method: 'PATCH',
			})
		);
		const body = JSON.parse(
			(mockServiceRoleFetch.mock.calls[0][1] as RequestInit).body as string
		);
		expect(body.test_count).toBe(2);
		expect(body.mbti).toBe('ENFP');
		expect(body.ai_type).toBe('claude');
	});
});

describe('createKennel', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls serviceRoleFetch with POST and correct body', async () => {
		mockServiceRoleFetch.mockResolvedValue(null);
		await createKennel({
			id: 'abc12345',
			recoveryCode: 'ABCD-EFGH-JKLM',
			mailboxId: 'mail1234',
			mbti: 'INTJ',
			aiType: 'deepseek',
			dogId: 'googler',
			quip: 'test quip',
			locale: 'en',
		});
		expect(mockServiceRoleFetch).toHaveBeenCalledWith(
			'kennels',
			expect.objectContaining({ method: 'POST' })
		);
		const body = JSON.parse(
			(mockServiceRoleFetch.mock.calls[0][1] as RequestInit).body as string
		);
		expect(body.id).toBe('abc12345');
		expect(body.recovery_code).toBe('ABCD-EFGH-JKLM');
		expect(body.test_count).toBe(1);
	});
});
