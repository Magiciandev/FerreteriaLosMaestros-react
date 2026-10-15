import { Container } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import FiltrosProductos from "../components/FiltrosProductos";
import GrillaProductos from "../components/GrillaProductos";
import { filtrarProductos } from "../utils/productos";

// Nombre del parámetro de la URL que guarda cada filtro.
const PARAMETROS = { texto: "q", categoria: "categoria", soloOfertas: "ofertas" };

// Catálogo con búsqueda y filtros. El estado de los filtros vive en la URL (useSearchParams):
// así el buscador del encabezado puede llegar aquí con /productos?q=cemento, se puede
// compartir el enlace y el botón "atrás" del navegador funciona.
// Props: productos, categorias y onAgregar.
function Productos({ productos, categorias, onAgregar }) {
  const [parametros, setParametros] = useSearchParams();
  const texto = parametros.get("q") ?? "";
  const categoria = parametros.get("categoria") ?? "";
  const soloOfertas = parametros.get("ofertas") === "1";

  const filtrados = filtrarProductos(productos, { texto, categoria, soloOfertas });

  function cambiar(campo, valor) {
    const siguiente = new URLSearchParams(parametros);
    if (valor === "" || valor === false) siguiente.delete(PARAMETROS[campo]);
    else siguiente.set(PARAMETROS[campo], valor === true ? "1" : valor);
    setParametros(siguiente, { replace: true });
  }

  return (
    <Container className="py-4">
      <h1 className="mb-3">Productos</h1>
      <FiltrosProductos
        categorias={categorias}
        texto={texto}
        categoria={categoria}
        soloOfertas={soloOfertas}
        onCambiar={cambiar}
        onLimpiar={() => setParametros({}, { replace: true })}
      />
      <p className="text-secondary my-3" aria-live="polite">
        {filtrados.length} {filtrados.length === 1 ? "producto" : "productos"}
      </p>
      <GrillaProductos
        productos={filtrados}
        onAgregar={onAgregar}
        mensajeVacio="No encontramos productos con esos filtros."
      />
    </Container>
  );
}

export default Productos;
