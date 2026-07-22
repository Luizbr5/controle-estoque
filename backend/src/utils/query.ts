export function parseQuery(query: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(query)) {
    if (value === "true") result[key] = true;
    else if (value === "false") result[key] = false;
    else if (!Number.isNaN(Number(value)) && value !== "") result[key] = Number(value);
    else result[key] = value;
  }

  return result;
}