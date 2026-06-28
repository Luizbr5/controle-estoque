export const currency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const number = (value: number) => value.toLocaleString("pt-BR");

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const date = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR");
