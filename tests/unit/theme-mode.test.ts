import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Theme mode support", () => {
  it("should support lilac mode in color scripts and dark-like purple styles", () => {
    const applyColorMode = readFileSync(
      join(process.cwd(), "src/components/common/ApplyColorMode.astro"),
      "utf-8",
    );
    const basicScripts = readFileSync(
      join(process.cwd(), "src/components/common/BasicScripts.astro"),
      "utf-8",
    );
    const customStyles = readFileSync(
      join(process.cwd(), "src/components/CustomStyles.astro"),
      "utf-8",
    );

    expect(applyColorMode).toContain("'lilac'");
    expect(applyColorMode).toContain("classList.remove('dark', 'lilac')");

    expect(basicScripts).toContain("currentTheme === 'dark' ? 'lilac'");
    expect(basicScripts).toContain("localStorage.theme = nextTheme");

    expect(customStyles).toContain(".lilac {");
    expect(customStyles).toContain("--aw-color-primary: rgb(168 85 247)");
    expect(customStyles).toContain("--aw-color-bg-page: rgb(19 13 34)");
  });
});
