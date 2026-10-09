// Formatea un número como pesos chilenos (CLP), sin decimales.
// Ejemplo: formatearCLP(5990) -> "$5.990"
export function formatearCLP(valor) {
  return Number(valor).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
}
