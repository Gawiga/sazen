import { describe, it, expect, vi } from "vitest";
import PocketBase from "pocketbase";
import { getPocketBaseClient, pbClient } from "../../src/lib/pocketbase";

vi.mock("pocketbase", () => {
  const MockPb = vi.fn(function MockPb(
    this: Record<string, unknown>,
    url: string,
  ) {
    this.url = url;
    this.authStore = { save: vi.fn(), token: null };
  });
  return { default: MockPb };
});

describe("PocketBase client helper", () => {
  it("getPocketBaseClient returns an instance", () => {
    const pb = getPocketBaseClient();
    expect(pb).toBeDefined();
    expect(PocketBase).toHaveBeenCalled();
  });

  it("pbClient is null on SSR", () => {
    if (typeof window === "undefined") {
      expect(pbClient).toBeNull();
      return;
    }

    expect(pbClient).toBeDefined();
  });
});
