import { useState } from "react";
import FiltrosProductos from "../components/FiltrosProductos";
import GrillaProductos from "../components/GrillaProductos";
import { filtrarProductos } from "../utils/productos";

const sinFiltros = { texto: "", categoria: "", soloOfertas: false };

// Catálogo con búsqueda y filtros. Los filtros viven en el estado de la página (useState).
// Props: productos, categorias y onAgregar.
function Productos({ productos, categorias, onAgregar }) {
  const [filtros, setFiltros] = useState(sinFiltros);
  const filtrados = filtrarProductos(productos, filtros);

  function cambiar(campo, valor) {
    setFiltros({ ...filtros, [campo]: valor });
  }

  return (
    <main className="container py-4">
      <h1 className="mb-3">Productos</h1>
      <FiltrosProductos
        categorias={categorias}
        texto={filtros.texto}
        categoria={filtros.categoria}
        soloOfertas={filtros.soloOfertas}
        onCambiar={cambiar}
        onLimpiar={() => setFiltros(sinFiltros)}
      />
      <p className="text-secondary my-3">
        {filtrados.length} {filtrados.length === 1 ? "producto" : "productos"}
      </p>
      <GrillaProductos productos={filtrados} onAgregar={onAgregar} />
    </main>
  );
}

export default Productos;
