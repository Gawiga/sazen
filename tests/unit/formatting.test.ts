import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  parseCurrency,
  formatDateForInput,
  formatDateInPortuguese,
} from "../../src/utils/formatting";

describe("Formatting Utilities", () => {
  describe("formatCurrency", () => {
    it("should format number as Brazilian currency", () => {
      expect(formatCurrency(100)).toBe("R$ 100,00");
      expect(formatCurrency(1000.5)).toBe("R$ 1.000,50");
      expect(formatCurrency("50.25")).toBe("R$ 50,25");
    });

    it("should return empty string for invalid input", () => {
      expect(formatCurrency("invalid")).toBe("");
      expect(formatCurrency(NaN)).toBe("");
    });
  });

  describe("parseCurrency", () => {
    it("should parse currency strings correctly", () => {
      expect(parseCurrency("R$ 100,00")).toBe(100);
      expect(parseCurrency("1.000,50")).toBe(1000.5);
      expect(parseCurrency("50,25")).toBe(50.25);
      expect(parseCurrency(100)).toBe(100);
    });

    it("should return 0 for empty or invalid input", () => {
      expect(parseCurrency("")).toBe(0);
      expect(parseCurrency("invalid")).toBe(0);
      // @ts-expect-error - Testing edge case with null
      expect(parseCurrency(null)).toBe(0);
    });
  });

  describe("formatDateForInput", () => {
    it("should format date for input field", () => {
      expect(formatDateForInput("2024-02-20 19:30:00")).toBe("2024-02-20");
      expect(formatDateForInput("2024-02-20T19:30:00Z")).toBe(
        "2024-02-20T19:30:00Z",
      );
    });

    it("should return empty string for empty input", () => {
      expect(formatDateForInput("")).toBe("");
    });
  });

  describe("formatDateInPortuguese", () => {
    it("should format date in Portuguese locale", () => {
      const date = new Date("2024-02-20T19:30:00Z");
      const result = formatDateInPortuguese(date.toISOString());
      expect(result).toContain("fevereiro");
      expect(result).toMatch(/às \d{2}h\d{2}/); // Match any time format
    });

    it("should return empty string for empty input", () => {
      expect(formatDateInPortuguese("")).toBe("");
    });
  });
});
