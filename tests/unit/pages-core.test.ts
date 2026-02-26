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

  it("pacientes/sessoes/relatorios-faturamento/relatorios-valores-receber should expose pagination sizes 20/50/100", () => {
    const pacientes = readPage("pacientes.astro");
    const sessoes = readPage("sessoes.astro");
    const relatoriosFaturamento = readPage("relatorios-faturamento.astro");
    const relatoriosValoresReceber = readPage(
      "relatorios-valores-receber.astro",
    );

    for (const page of [
      pacientes,
      sessoes,
      relatoriosFaturamento,
      relatoriosValoresReceber,
    ]) {
      expect(page).toContain('data-per-page="20"');
      expect(page).toContain('data-per-page="50"');
      expect(page).toContain('data-per-page="100"');
    }
  });

  it("info banners should be closable in pacientes/sessoes/relatorios", () => {
    const pacientes = readPage("pacientes.astro");
    const sessoes = readPage("sessoes.astro");
    const relatorios = readPage("relatorios.astro");

    expect(pacientes).toContain("close-patients-banner");
    expect(sessoes).toContain("close-sessions-banner");
    expect(relatorios).toContain("close-reports-banner");
  });

  it("pacientes should default to active filter and hide status column", () => {
    const pacientes = readPage("pacientes.astro");

    expect(pacientes).toContain('data-status="ativo"');
    expect(pacientes).toContain('data-status="inativo"');
    expect(pacientes).toContain('data-status="todos"');
    expect(pacientes).toContain('<th class="p-2">Nome</th>');
    expect(pacientes).toContain('<th class="p-2 text-right">Ações</th>');
    expect(pacientes).toContain("row-actions-menu");
    expect(pacientes).not.toContain('<th class="p-2">Contato</th>');
    expect(pacientes).not.toContain('<th class="p-2">Valor</th>');
    expect(pacientes).not.toContain('<th class="p-2">Status</th>');
  });

  it("sessoes should use compact table with date/actions and menu-based row actions", () => {
    const sessoes = readPage("sessoes.astro");

    expect(sessoes).toContain('<th class="p-3">Data</th>');
    expect(sessoes).toContain('<th class="p-3 text-right">Ações</th>');
    expect(sessoes).toContain('id="session-name-filter"');
    expect(sessoes).toContain("applySessionFilter");
    expect(sessoes).toContain("formatSessionDateShort");
    expect(sessoes).toContain("row-actions-menu");
    expect(sessoes).toContain("status-toggle");
    expect(sessoes).not.toContain('<th class="p-3">Paciente</th>');
    expect(sessoes).not.toContain('<th class="p-3">Valor</th>');
    expect(sessoes).not.toContain('<th class="p-3 text-center">Pagamento</th>');
  });

  it("relatorios valores a receber should expose month column", () => {
    const relatoriosValoresReceber = readPage(
      "relatorios-valores-receber.astro",
    );

    expect(relatoriosValoresReceber).toContain('<th class="p-2">Mês</th>');
    expect(relatoriosValoresReceber).toContain("getMonthLabel");
    expect(relatoriosValoresReceber).toContain('colspan="3"');
  });

  it("dashboard and index should still exist with navigation to core flow", () => {
    const dashboard = readPage("dashboard.astro");
    const index = readPage("index.astro");

    expect(dashboard).toContain("Dashboard");
    expect(dashboard).toContain('href="/relatorios-faturamento"');
    expect(dashboard).toContain('href="/relatorios-valores-receber"');
    expect(index).toContain('href="/login"');
    expect(index).toContain('href="/dashboard"');
  });
});
