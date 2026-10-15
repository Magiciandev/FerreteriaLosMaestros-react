import { rutaImagen } from "../utils/productos";

// Foto del producto en un recuadro 4:3. Si el producto no tiene foto, muestra un marcador de texto.
function ImagenProducto({ producto, className = "" }) {
  const ruta = rutaImagen(producto);
  return (
    <div className={`imagen-producto ratio ratio-4x3 ${className}`}>
      {ruta ? (
        <img src={ruta} alt={producto.nombre} loading="lazy" />
      ) : (
        <div className="imagen-producto__vacia" role="img" aria-label="Sin imagen disponible">
          <span>Sin imagen</span>
        </div>
      )}
    </div>
  );
}

export default ImagenProducto;
