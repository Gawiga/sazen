import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("UserMenu auth behavior", () => {
  it("should fetch current user with auth header, keep menu rendered, and not force redirect", () => {
    const userMenu = readFileSync(
      join(process.cwd(), "src/components/auth/UserMenu.astro"),
      "utf-8",
    );

    expect(userMenu).toContain('fetch("/api/auth/user", {');
    expect(userMenu).toContain("Authorization");
    expect(userMenu).toContain('credentials: "include"');
    expect(userMenu).not.toContain('!user && "hidden"');
    expect(userMenu).not.toContain('window.location.href = "/login"');
  });

  it("should support fallback merge and dynamic greeting fade update", () => {
    const userMenu = readFileSync(
      join(process.cwd(), "src/components/auth/UserMenu.astro"),
      "utf-8",
    );

    expect(userMenu).toContain("resolveName");
    expect(userMenu).toContain("updateMenuContent");
    expect(userMenu).toContain("transition-opacity");
    expect(userMenu).toContain('userGreeting.classList.add("opacity-0")');
    expect(userMenu).toContain("? { ...fallbackUser, ...fetchedUser }");
    expect(userMenu).toContain("__userMenuFetchPromise");
    expect(userMenu).toContain('menu.dataset.userRemoteLoaded = "true"');
  });
});
