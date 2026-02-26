import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("navigation config", () => {
  it("should expose split report routes in header and footer", () => {
    const navigation = readFileSync(
      join(process.cwd(), "src/navigation.ts"),
      "utf-8",
    );

    expect(navigation).toContain('getPermalink("/relatorios-faturamento")');
    expect(navigation).toContain('getPermalink("/relatorios-valores-receber")');
    expect(navigation).toContain('text: "Faturamento Mensal"');
    expect(navigation).toContain('text: "Valores a Receber"');
  });
});
