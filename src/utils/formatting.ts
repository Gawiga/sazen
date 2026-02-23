// Utilitários para formatação de dados reutilizáveis

/**
 * Formata um número como moeda em Real
 * @param value - Número a formatar
 * @returns String formatada como "R$ X,XX"
 */
export function formatCurrency(value: string | number): string {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return `R$ ${number.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Converte entrada de moeda para número
 * @param value - String de entrada (ex: "12,50" ou "R$ 12,50")
 * @returns Número normalizado
 */
export function parseCurrency(value: string | number): number {
  if (!value) return 0;
  const normalized = String(value)
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Converte data ISO para formato de entrada (YYYY-MM-DD)
 * @param dateString - String ISO ou qualquer formato
 * @returns String no formato YYYY-MM-DD
 */
export function formatDateForInput(dateString: string): string {
  if (!dateString) return "";
  return dateString.split(" ")[0]; // Pega apenas a data, descarta hora
}

/**
 * Converte data para formato legível em português
 * @param dateString - String ISO
 * @returns String formatada como "segunda-feira, 20 de fevereiro às 19h30"
 */
export function formatDateInPortuguese(dateString: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const days = [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado",
  ];
  const months = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${dayName}, ${day} de ${monthName} às ${hours}h${minutes}`;
}

/**
 * Anexa máscara de moeda a um input
 * @param input - Elemento input
 */
export function attachCurrencyMask(input: HTMLInputElement | null): void {
  if (!input) return;

  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^\d,.-]/g, "");
  });

  input.addEventListener("focus", () => {
    const numeric = parseCurrency(input.value);
    if (!numeric) {
      input.value = "";
      return;
    }

    input.value = Number.isInteger(numeric)
      ? String(numeric)
      : String(numeric).replace(".", ",");
  });

  input.addEventListener("blur", () => {
    if (!input.value.trim()) return;
    input.value = formatCurrency(parseCurrency(input.value));
  });
}

/**
 * Obtém um elemento por ID com type casting seguro
 * @param id - ID do elemento
 * @returns Elemento HTML com propriedades comuns
 */
export function getFormElement(id: string): HTMLElement & {
  value?: string;
  checked?: boolean;
  disabled?: boolean;
  reset?: () => void;
  dataset?: DOMStringMap;
} {
  return document.getElementById(id) as HTMLElement & {
    value?: string;
    checked?: boolean;
    disabled?: boolean;
    reset?: () => void;
    dataset?: DOMStringMap;
  };
}

/**
 * Alterna visibilidade de um elemento
 * @param elementId - ID do elemento
 * @param show - Mostrar ou esconder
 */
export function toggleElement(elementId: string, show: boolean): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.toggle("hidden", !show);
  }
}
