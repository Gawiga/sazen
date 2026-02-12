/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { decodeJwt, getTokenFromRequest } from '../../src/lib/jwt-helper';

describe('JWT Helper', () => {
  describe('decodeJwt', () => {
    it('should decode valid JWT token', () => {
      // Token with payload: { id: '1', email: 'test@example.com', exp: 9999999999 }
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjk5OTk5OTk5OTl9.signature';
      const result = decodeJwt(token);

      expect(result.valid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload.id).toBe('1');
      expect(result.payload.email).toBe('test@example.com');
    });

    it('should reject expired token', () => {
      // Token with exp: 1000000000 (year 2001)
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjEwMDAwMDAwMDB9.signature';
      const result = decodeJwt(token);

      expect(result.valid).toBe(false);
      expect(result.payload).toBeDefined();
    });

    it('should reject malformed token - wrong number of parts', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEifQ';
      const result = decodeJwt(token);

      expect(result.valid).toBe(false);
      expect(result.payload).toEqual({});
    });

    it('should reject invalid base64 payload', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.!!!invalid!!!.signature';
      const result = decodeJwt(token);

      expect(result.valid).toBe(false);
      expect(result.payload).toEqual({});
    });

    it('should reject invalid JSON payload', () => {
      // Base64 of "{invalid json"
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2ludmFsaWQganNvbg==.signature';
      const result = decodeJwt(token);

      expect(result.valid).toBe(false);
      expect(result.payload).toEqual({});
    });

    it('should accept token without exp claim', () => {
      // Token with payload: { id: '1', email: 'test@example.com' }
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ==.signature';
      const result = decodeJwt(token);

      expect(result.valid).toBe(true);
      expect(result.payload.id).toBe('1');
    });

    it('should handle empty string token', () => {
      const result = decodeJwt('');

      expect(result.valid).toBe(false);
      expect(result.payload).toEqual({});
    });

    it('should handle null/undefined gracefully', () => {
      expect(() => decodeJwt(null as any)).not.toThrow();
      expect(() => decodeJwt(undefined as any)).not.toThrow();
    });
  });

  describe('getTokenFromRequest', () => {
    it('should extract token from Authorization header', () => {
      const request = new Request('https://example.com', {
        headers: {
          Authorization: 'Bearer abc123token',
        },
      });

      const token = getTokenFromRequest(request);
      expect(token).toBe('abc123token');
    });

    it('should handle Authorization header case-insensitivity', () => {
      const request = new Request('https://example.com', {
        headers: {
          authorization: 'Bearer mytoken',
        },
      });

      const token = getTokenFromRequest(request);
      expect(token).toBe('mytoken');
    });

    it('should ignore non-Bearer Authorization header', () => {
      const request = new Request('https://example.com', {
        headers: {
          Authorization: 'Basic base64credentials',
        },
      });

      const token = getTokenFromRequest(request);
      expect(token).toBeNull();
    });

    it('should fall back to cookie when no Authorization header', () => {
      const request = new Request('https://example.com');
      const cookies = {
        get: (name: string) => {
          if (name === 'pb_auth') return { value: 'cookie_token_value' };
          return null;
        },
      };

      const token = getTokenFromRequest(request, cookies);
      expect(token).toBe('cookie_token_value');
    });

    it('should prioritize Authorization header over cookie', () => {
      const request = new Request('https://example.com', {
        headers: {
          Authorization: 'Bearer header_token',
        },
      });
      const cookies = {
        get: (name: string) => {
          if (name === 'pb_auth') return { value: 'cookie_token' };
          return null;
        },
      };

      const token = getTokenFromRequest(request, cookies);
      expect(token).toBe('header_token');
    });

    it('should return null when no token found', () => {
      const request = new Request('https://example.com');
      const cookies = {
        get: () => null,
      };

      const token = getTokenFromRequest(request, cookies);
      expect(token).toBeNull();
    });

    it('should return null when request undefined and no cookies', () => {
      const token = getTokenFromRequest(undefined, undefined);
      expect(token).toBeNull();
    });

    it('should return null from cookies when they return undefined value', () => {
      const request = new Request('https://example.com');
      const cookies = {
        get: (name: string) => {
          if (name === 'pb_auth') return undefined;
          return null;
        },
      };

      const token = getTokenFromRequest(request, cookies);
      expect(token).toBeNull();
    });

    it('should handle Bearer token with extra spaces', () => {
      const request = new Request('https://example.com', {
        headers: {
          Authorization: 'Bearer   token_with_spaces',
        },
      });

      const token = getTokenFromRequest(request);
      expect(token).toBe('  token_with_spaces');
    });
  });
});
