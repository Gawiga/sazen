/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import PocketBase from 'pocketbase';
import { AuthService } from '../../src/lib/auth';

vi.mock('pocketbase', () => {
  const mockCollection = {
    authWithPassword: vi.fn().mockResolvedValue({ token: 'token', record: { id: '1', email: 'a@b' } }),
    create: vi.fn().mockResolvedValue({ id: '1' }),
  };

  const MockPb = vi.fn(function MockPb(this: any) {
    return {
      collection: () => mockCollection,
      authStore: {
        token: 'token',
        record: { id: '1', email: 'a@b' },
      },
    };
  });

  return { default: MockPb };
});

describe('AuthService', () => {
  it('loginWithPassword returns success', async () => {
    const svc = new AuthService(new PocketBase() as any);
    const res = await svc.loginWithPassword('a@b', 'pass');
    expect(res.success).toBe(true);
    expect(res.user).toBeDefined();
  });

  it('signup returns success', async () => {
    const svc = new AuthService(new PocketBase() as any);
    const res = await svc.signup('c@d', 'pass', 'pass');
    expect(res.success).toBe(true);
  });
});
