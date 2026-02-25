import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function readPage(file: string): string {
  return readFileSync(join(process.cwd(), "src/pages", file), "utf-8");
}

describe("Core pages content", () => {
  it("login should use secure POST form without query password flow", () => {
    const form = readFileSync(
      join(process.cwd(), "src/components/auth/LoginForm.astro"),
      "utf-8",
    );

    expect(form).toContain('method="post"');
    expect(form).toContain("fetch('/api/auth/login'");
    expect(form).not.toContain('method="get"');
  });

  it("pacientes/sessoes/relatorios should expose pagination sizes 20/50/100", () => {
    const pacientes = readPage("pacientes.astro");
    const sessoes = readPage("sessoes.astro");
    const relatorios = readPage("relatorios.astro");

    for (const page of [pacientes, sessoes, relatorios]) {
      expect(page).toContain('data-per-page="20"');
      expect(page).toContain('data-per-page="50"');
      expect(page).toContain('data-per-page="100"');
    }
  });

  it("dashboard and index should still exist with navigation to core flow", () => {
    const dashboard = readPage("dashboard.astro");
    const index = readPage("index.astro");

    expect(dashboard).toContain("Dashboard");
    expect(index).toContain('href="/login"');
    expect(index).toContain('href="/dashboard"');
  });
});
