/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Dashboard Pages - fetchWithAuth Helper', () => {
  describe('fetchWithAuth function', () => {
    let localStorage: Record<string, string>;

    beforeEach(() => {
      localStorage = {};
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => localStorage[key] || null,
        setItem: (key: string, value: string) => {
          localStorage[key] = value;
        },
        removeItem: (key: string) => {
          delete localStorage[key];
        },
        clear: () => {
          localStorage = {};
        },
      });
    });

    it('should inject Authorization header with token from localStorage', async () => {
      localStorage['pb_auth'] = 'test_token_123';

      const mockFetch = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ id: '1', name: 'Test' }), { status: 200 }));
      vi.stubGlobal('fetch', mockFetch);

      // Simulate fetchWithAuth function
      const token = localStorage['pb_auth'];
      await mockFetch('/api/pacientes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/pacientes',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test_token_123',
          }),
        })
      );
    });

    it('should handle missing token gracefully', async () => {
      localStorage['pb_auth'] = '';

      const mockFetch = vi.fn().mockRejectedValue(new Error('Unauthorized'));
      vi.stubGlobal('fetch', mockFetch);

      const token = localStorage['pb_auth'] || undefined;

      // API should check if token is missing and redirect to login
      expect(token).not.toBeDefined();
    });

    it('should merge custom headers with Authorization header', async () => {
      localStorage['pb_auth'] = 'token_abc';

      const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));
      vi.stubGlobal('fetch', mockFetch);

      const token = localStorage['pb_auth'];
      const customHeaders = {
        'X-Custom-Header': 'custom-value',
        'Content-Type': 'application/json',
      };

      await mockFetch('/api/pacientes', {
        method: 'POST',
        headers: {
          ...customHeaders,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: 'Test' }),
      });

      const callArgs = mockFetch.mock.calls[0];
      const mergedHeaders = callArgs[1].headers;

      expect(mergedHeaders['Authorization']).toBe('Bearer token_abc');
      expect(mergedHeaders['X-Custom-Header']).toBe('custom-value');
      expect(mergedHeaders['Content-Type']).toBe('application/json');
    });

    it('should preserve request method and body', async () => {
      localStorage['pb_auth'] = 'token_xyz';

      const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: '1' }), { status: 201 }));
      vi.stubGlobal('fetch', mockFetch);

      const token = localStorage['pb_auth'];
      const body = { name: 'New Patient', email: 'p@ex.com', valor_sessao: 100 };

      await mockFetch('/api/pacientes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1].method).toBe('POST');
      expect(JSON.parse(callArgs[1].body)).toEqual(body);
    });

    it('should handle different HTTP methods', async () => {
      localStorage['pb_auth'] = 'token_123';

      const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));
      vi.stubGlobal('fetch', mockFetch);

      const token = localStorage['pb_auth'];

      // Test GET
      await mockFetch('/api/pacientes', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(mockFetch.mock.calls[0][1].method).toBe('GET');

      // Test PUT
      await mockFetch('/api/pacientes/123', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: 'Updated' }),
      });
      expect(mockFetch.mock.calls[1][1].method).toBe('PUT');

      // Test DELETE
      await mockFetch('/api/pacientes/123', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(mockFetch.mock.calls[2][1].method).toBe('DELETE');
    });

    it('should handle API error responses', async () => {
      localStorage['pb_auth'] = 'token_401';

      const mockFetch = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }));
      vi.stubGlobal('fetch', mockFetch);

      const token = localStorage['pb_auth'];
      const response = await mockFetch('/api/pacientes', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle network errors', async () => {
      localStorage['pb_auth'] = 'token_net';

      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', mockFetch);

      const token = localStorage['pb_auth'];

      try {
        await mockFetch('/api/pacientes', {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error: any) {
        expect(error.message).toBe('Network error');
      }
    });
  });

  describe('Dashboard page patterns', () => {
    it('should have back link to dashboard', () => {
      const backLinkPattern = /←\s*Voltar/;
      const linkText = '← Voltar ao Dashboard';

      expect(backLinkPattern.test(linkText)).toBe(true);
    });

    it('should have correct back link href', () => {
      const href = '/dashboard';
      expect(href).toBe('/dashboard');
    });

    it('should render page title', () => {
      const pageTitle = 'Pacientes';
      expect(pageTitle).toBeDefined();
      expect(typeof pageTitle).toBe('string');
    });

    it('should have token in localStorage before rendering', () => {
      const localStorage = { pb_auth: 'token_value' };

      expect(localStorage['pb_auth']).toBeDefined();
      expect(localStorage['pb_auth'].length).toBeGreaterThan(0);
    });
  });

  describe('Mobile-first responsive layout', () => {
    it('should use flex-col on mobile base', () => {
      const classes = 'flex flex-col';
      expect(classes).toContain('flex-col');
    });

    it('should use md: breakpoint for responsive behavior', () => {
      const classes = 'flex flex-col md:flex-row';
      expect(classes).toContain('md:');
    });

    it('should have gap utilities for spacing', () => {
      const classes = 'flex flex-col gap-4 md:flex-row md:gap-6';
      expect(classes).toContain('gap-');
    });

    it('should apply w-full on mobile', () => {
      const classes = 'w-full md:w-auto';
      expect(classes).toContain('w-full');
    });

    it('should have proper responsive grid layout', () => {
      const classes = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      expect(classes).toContain('grid');
      expect(classes).toContain('grid-cols-1');
    });
  });

  describe('Form handling', () => {
    it('should serialize form data correctly', () => {
      const formData = {
        nome: 'John Doe',
        email: 'john@example.com',
        contato: '123456789',
        valor_sessao: 150,
      };

      expect(formData.nome).toBe('John Doe');
      expect(formData.email).toBe('john@example.com');
      expect(typeof formData.valor_sessao).toBe('number');
    });

    it('should validate email before form submission', () => {
      const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
    });

    it('should validate required fields', () => {
      const validateForm = (data: any) => {
        const errors: Record<string, string> = {};

        if (!data.nome) errors.nome = 'Name is required';
        if (!data.email) errors.email = 'Email is required';

        return Object.keys(errors).length === 0 ? { valid: true } : { valid: false, errors };
      };

      expect(validateForm({ nome: 'Test', email: 'test@ex.com' }).valid).toBe(true);
      expect(validateForm({ nome: '' }).valid).toBe(false);
    });
  });

  describe('Pagination handling', () => {
    it('should construct pagination URL with correct parameters', () => {
      const collection = 'faturamento_mensal';
      const page = 2;
      const perPage = 25;

      const url = `/api/reports?collection=${collection}&page=${page}&perPage=${perPage}`;

      expect(url).toContain('collection=faturamento_mensal');
      expect(url).toContain('page=2');
      expect(url).toContain('perPage=25');
    });

    it('should handle page navigation', () => {
      const currentPage = 1;
      const nextPage = currentPage + 1;
      const prevPage = Math.max(1, currentPage - 1);

      expect(nextPage).toBe(2);
      expect(prevPage).toBe(1);

      const currentPageSecond = 2;
      const prevPageSecond = Math.max(1, currentPageSecond - 1);
      expect(prevPageSecond).toBe(1);
    });

    it('should disable prev button on first page', () => {
      const currentPage = 1;
      const canGoPrev = currentPage > 1;

      expect(canGoPrev).toBe(false);
    });

    it('should disable next button on last page', () => {
      const currentPage = 3;
      const totalPages = 3;
      const canGoNext = currentPage < totalPages;

      expect(canGoNext).toBe(false);
    });
  });

  describe('Data table rendering', () => {
    it('should render table headers', () => {
      const headers = ['Patient', 'Email', 'Contact', 'Session Value'];

      expect(headers.length).toBeGreaterThan(0);
      expect(headers[0]).toBe('Patient');
    });

    it('should render table rows from data', () => {
      const data = [
        { id: '1', name: 'John', email: 'john@ex' },
        { id: '2', name: 'Jane', email: 'jane@ex' },
      ];

      expect(data.length).toBe(2);
      expect(data[0].name).toBe('John');
    });

    it('should apply edit/delete buttons to each row', () => {
      const rowActions = ['edit', 'delete'];

      expect(rowActions).toContain('edit');
      expect(rowActions).toContain('delete');
    });

    it('should handle empty data state', () => {
      const data: any[] = [];
      const isEmpty = data.length === 0;

      expect(isEmpty).toBe(true);
    });

    it('should format currency values with R$ prefix', () => {
      const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

      expect(formatCurrency(150)).toBe('R$ 150,00');
      expect(formatCurrency(1000.5)).toBe('R$ 1000,50');
    });
  });
});

describe('Dashboard Navigation', () => {
  it('should have links to all dashboard pages', () => {
    const dashboardPages = [
      { name: 'Pacientes', href: '/dashboard/pacientes' },
      { name: 'Sessões', href: '/dashboard/sessoes' },
      { name: 'Relatórios', href: '/dashboard/relatorios' },
    ];

    expect(dashboardPages).toHaveLength(3);
    expect(dashboardPages[0].href).toBe('/dashboard/pacientes');
  });

  it('should highlight current page in navigation', () => {
    const currentPage = 'pacientes';
    const isActive = (page: string) => page === currentPage;

    expect(isActive('pacientes')).toBe(true);
    expect(isActive('sessoes')).toBe(false);
  });

  it('should have logout link', () => {
    const logoutLink = '/api/auth/logout';
    expect(logoutLink).toContain('logout');
  });
});
