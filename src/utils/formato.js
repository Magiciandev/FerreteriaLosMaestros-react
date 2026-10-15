// Formatea un número como pesos chilenos (CLP), sin decimales.
// Ejemplo: formatearCLP(5990) -> "$5.990"
export function formatearCLP(valor) {
  return Number(valor).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
}

// "2026-09-12" -> "12 de septiembre de 2026".
// La fecha se arma con año, mes y día por separado y no con new Date("2026-09-12"): esa forma
// se interpreta en UTC y, en Chile, mostraría el día anterior.
export function formatearFecha(iso) {
  const [anio, mes, dia] = String(iso).split("-").map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
