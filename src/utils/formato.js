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

// "2026-10-16T14:30:00.000Z" -> "16-10-2026 11:30:00" (según la zona horaria del navegador).
// Las órdenes guardan la fecha completa (con hora), a diferencia de formatearFecha, que
// recibe solo el día.
export function formatearFechaHora(iso) {
  return new Date(iso).toLocaleString("es-CL");
}