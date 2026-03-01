import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("UserMenu auth behavior", () => {
  it("should fetch current user with auth header and not force redirect when user is unavailable", () => {
    const userMenu = readFileSync(
      join(process.cwd(), "src/components/auth/UserMenu.astro"),
      "utf-8",
    );

    expect(userMenu).toContain('fetch("/api/auth/user", {');
    expect(userMenu).toContain("Authorization");
    expect(userMenu).toContain('credentials: "include"');
    expect(userMenu).not.toContain('window.location.href = "/login"');
  });

  it("should support nome/email fallback and merge fetched user with local fallback", () => {
    const userMenu = readFileSync(
      join(process.cwd(), "src/components/auth/UserMenu.astro"),
      "utf-8",
    );

    expect(userMenu).toContain('typeof user.nome === "string"');
    expect(userMenu).toContain('typeof user.email === "string"');
    expect(userMenu).toContain("? { ...fallbackUser, ...fetchedUser }");
  });
});
