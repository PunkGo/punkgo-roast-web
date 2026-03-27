import { describe, it, expect } from 'vitest';
import { validateId } from './supabase';

describe('validateId', () => {
	it('accepts valid 8-char lowercase alphanumeric', () => {
		expect(validateId('a7x9k2mf')).toBe(true);
		expect(validateId('00000000')).toBe(true);
		expect(validateId('abcdefgh')).toBe(true);
		expect(validateId('12345678')).toBe(true);
	});

	it('rejects too short', () => {
		expect(validateId('abc')).toBe(false);
		expect(validateId('abcdefg')).toBe(false);
		expect(validateId('')).toBe(false);
	});

	it('rejects too long', () => {
		expect(validateId('abcdefghi')).toBe(false);
		expect(validateId('123456789')).toBe(false);
	});

	it('rejects uppercase', () => {
		expect(validateId('ABCDEFGH')).toBe(false);
		expect(validateId('aBcDeFgH')).toBe(false);
	});

	it('rejects special characters', () => {
		expect(validateId('abc-efgh')).toBe(false);
		expect(validateId('abc_efgh')).toBe(false);
		expect(validateId("abc'efgh")).toBe(false);
		expect(validateId('abc efgh')).toBe(false);
	});

	it('rejects SQL injection attempts', () => {
		expect(validateId("'; DROP")).toBe(false);
		expect(validateId('1=1;--ab')).toBe(false);
	});
});

describe('sendMessage content sanitization', () => {
	it('strips HTML tags from content', () => {
		// Test the regex pattern used in sendMessage
		const sanitize = (s: string) => s.replace(/<[^>]*>/g, '');

		expect(sanitize('<script>alert("xss")</script>')).toBe('alert("xss")');
		expect(sanitize('<img src=x onerror=alert(1)>')).toBe('');
		expect(sanitize('Hello <b>world</b>')).toBe('Hello world');
		expect(sanitize('No tags here')).toBe('No tags here');
		expect(sanitize('<a href="javascript:void(0)">click</a>')).toBe('click');
	});

	it('truncates to 2000 chars after sanitization', () => {
		const sanitize = (s: string) => s.replace(/<[^>]*>/g, '').slice(0, 2000);

		const long = 'a'.repeat(3000);
		expect(sanitize(long).length).toBe(2000);
	});
});
