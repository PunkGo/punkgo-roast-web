import { describe, it, expect } from 'vitest';
import { computeMBTI, getDogByMBTI, encodeResultId, decodeResultId, encodeMBTI, dogs } from './dogs';

describe('computeMBTI', () => {
	it('computes MBTI from 5 answers', () => {
		const answers = [
			{ question: 1, choice: 'A' }, // F
			{ question: 2, choice: 'A' }, // J
			{ question: 3, choice: 'A' }, // S+J
			{ question: 4, choice: 'B' }, // I+T
			{ question: 5, choice: 'A' }, // J
		];
		const mbti = computeMBTI(answers);
		expect(mbti).toHaveLength(4);
		expect(mbti).toMatch(/^[EI][SN][TF][JP]$/);
	});

	it('handles all A choices', () => {
		const answers = Array.from({ length: 5 }, (_, i) => ({ question: i + 1, choice: 'A' }));
		const mbti = computeMBTI(answers);
		expect(mbti).toMatch(/^[EI][SN][TF][JP]$/);
	});
});

describe('getDogByMBTI', () => {
	it('returns correct dog for each MBTI type', () => {
		for (const [mbti, dog] of Object.entries(dogs)) {
			expect(getDogByMBTI(mbti).mbti).toBe(mbti);
			expect(getDogByMBTI(mbti).id).toBe(dog.id);
		}
	});

	it('returns fallback for unknown MBTI', () => {
		const dog = getDogByMBTI('XXXX');
		expect(dog).toBeDefined();
		expect(dog.id).toBe('googler'); // ENTP fallback
	});
});

describe('encodeResultId / decodeResultId', () => {
	it('roundtrips quiz mode answers', () => {
		const answers = [
			{ question: 1, choice: 'B' },
			{ question: 2, choice: 'C' },
			{ question: 3, choice: 'A' },
			{ question: 4, choice: 'D' },
			{ question: 5, choice: 'A' },
		];
		const id = encodeResultId(answers);
		const mbti = decodeResultId(id);
		expect(mbti).toBe(computeMBTI(answers));
	});

	it('generates valid base62 string', () => {
		const answers = Array.from({ length: 5 }, (_, i) => ({ question: i + 1, choice: 'A' }));
		const id = encodeResultId(answers);
		expect(id).toMatch(/^[0-9A-Za-z]+$/);
		expect(id.length).toBeGreaterThanOrEqual(3);
		expect(id.length).toBeLessThanOrEqual(8);
	});
});

describe('encodeMBTI / decodeResultId (LMLPA mode)', () => {
	it('roundtrips MBTI type', () => {
		for (const mbti of Object.keys(dogs)) {
			const id = encodeMBTI(mbti);
			const decoded = decodeResultId(id);
			expect(decoded).toBe(mbti);
		}
	});

	it('handles different AI types', () => {
		const id = encodeMBTI('INTJ', 'claude');
		const decoded = decodeResultId(id);
		expect(decoded).toBe('INTJ');
	});
});

describe('decodeResultId validation', () => {
	it('rejects empty string', () => {
		expect(() => decodeResultId('')).toThrow();
	});

	it('rejects too short', () => {
		expect(() => decodeResultId('ab')).toThrow();
	});

	it('rejects invalid characters', () => {
		expect(() => decodeResultId('abc!defg')).toThrow();
	});
});
