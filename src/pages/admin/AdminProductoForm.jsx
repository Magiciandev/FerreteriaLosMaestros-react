import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import CampoFormulario from "../../components/CampoFormulario";
import {
  validarCategoria,
  validarCodigoProducto,
  validarDescripcionProducto,
  validarDescuento,
  validarNombreProducto,
  validarPrecio,
  validarStock,
  validarStockMinimo,
  validarTextoCorto,
} from "../../utils/validaciones";

// Los campos de un formulario guardan siempre texto, así que los números se pasan a String al
// precargar y se convierten de vuelta a número recién al guardar.
function valoresIniciales(producto) {
  return {
    id: producto?.id ?? "",
    nombre: producto?.nombre ?? "",
    categoria: producto?.categoria ?? "",
    subcategoria: producto?.subcategoria ?? "",
    marca: producto?.marca ?? "",
    unidad: producto?.unidad ?? "",
    precio: producto ? String(producto.precio) : "",
    descuento: String(producto?.descuento ?? 0),
    stock: producto ? String(producto.stock) : "",
    stockMinimo: producto?.stockMinimo != null ? String(producto.stockMinimo) : "",
    descripcion: producto?.descripcion ?? "",
  };
}

// Formulario en sí. Está separado del componente de abajo para que React lo vuelva a crear (y
// por lo tanto vuelva a precargar los campos) cada vez que cambia el producto: ver "key" abajo.
function FormularioProducto({ producto, productos, categorias, onCrear, onActualizar }) {
  const editando = Boolean(producto);
  const [datos, setDatos] = useState(valoresIniciales(producto));
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [errorServidor, setErrorServidor] = useState("");
  const [guardando, setGuardando] = useState(false);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
    setMensaje("");
  }

  // Revisa cada campo con su regla (utils/validaciones.js) y devuelve un error (o "") por campo.
  // El código además no puede repetirse, y eso solo se sabe mirando la lista de productos.
  function validar() {
    const repetido = productos.some((actual) => actual.id.toLowerCase() === datos.id.trim().toLowerCase());
    return {
      id: validarCodigoProducto(datos.id) || (!editando && repetido ? "Ya existe un producto con ese código." : ""),
      nombre: validarNombreProducto(datos.nombre),
      categoria: validarCategoria(datos.categoria),
      subcategoria: validarTextoCorto("La subcategoría")(datos.subcategoria),
      marca: validarTextoCorto("La marca")(datos.marca),
      unidad: validarTextoCorto("La unidad")(datos.unidad),
      precio: validarPrecio(datos.precio),
      descuento: validarDescuento(datos.descuento),
      stock: validarStock(datos.stock),
      stockMinimo: validarStockMinimo(datos.stockMinimo),
      descripcion: validarDescripcionProducto(datos.descripcion),
    };
  }

  async function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;

    // Se arma el producto con los tipos correctos: precio, descuento y stock son números; el
    // stock mínimo vacío se guarda como null (sin umbral), no como 0, porque con 0 un producto
    // agotado contaría como "crítico" sin que nadie lo haya definido así.
    const cambios = {
      nombre: datos.nombre.trim(),
      categoria: datos.categoria,
      subcategoria: datos.subcategoria.trim(),
      marca: datos.marca.trim(),
      unidad: datos.unidad.trim(),
      precio: Math.round(Number(datos.precio)),
      descuento: Number(datos.descuento) || 0,
      stock: Number(datos.stock),
      stockMinimo: datos.stockMinimo.trim() === "" ? null : Number(datos.stockMinimo),
      descripcion: datos.descripcion.trim(),
    };

    // Al editar, App mezcla los cambios sobre el producto, así que se conserva la imagen y el
    // código. Al crear, el código se guarda en mayúsculas como los existentes. Si el servidor
    // rechaza la operación (por ejemplo, un código repetido), se muestra su mensaje.
    setGuardando(true);
    setErrorServidor("");
    try {
      if (editando) await onActualizar(producto.id, cambios);
      else await onCrear({ ...cambios, id: datos.id.trim().toUpperCase(), imagen: null });
      setMensaje(`El producto "${cambios.nombre}" se ${editando ? "actualizó" : "creó"}.`);
      if (!editando) setDatos(valoresIniciales(null));
    } catch (error) {
      setErrorServidor(error.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section aria-labelledby="titulo-admin-producto-form">
      <h1 id="titulo-admin-producto-form" className="h3 mb-3">
        {editando ? "Editar producto" : "Nuevo producto"}
      </h1>
      {mensaje && (
        <div className="alert alert-success" role="status">
          {mensaje} <Link to="/admin/productos" className="alert-link">Volver al listado</Link>
        </div>
      )}
      {errorServidor && <div className="alert alert-danger" role="alert">{errorServidor}</div>}
      <Form noValidate onSubmit={enviar} aria-label="Formulario de producto" style={{ maxWidth: "48rem" }}>
        <Row>
          <Col xs={12} md={4}>
            <CampoFormulario
              id="producto-codigo"
              etiqueta="Código"
              name="id" valor={datos.id} error={errores.id} onChange={cambiar}
              disabled={editando}
              ayuda={editando ? "No se puede cambiar: las órdenes y el carrito lo usan." : "Mínimo 3 caracteres, por ejemplo MC090."}
              autoComplete="off"
            />
          </Col>
          <Col xs={12} md={8}>
            <CampoFormulario id="producto-nombre" etiqueta="Nombre" name="nombre" valor={datos.nombre} error={errores.nombre} onChange={cambiar} autoComplete="off" />
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            {/* La categoría es una lista porque solo puede ser una de las que existen. */}
            <Form.Group className="mb-3" controlId="producto-categoria">
              <Form.Label>Categoría</Form.Label>
              <select
                id="producto-categoria"
                name="categoria"
                className={`form-select${errores.categoria ? " is-invalid" : ""}`}
                value={datos.categoria}
                onChange={cambiar}
                aria-describedby={errores.categoria ? "producto-categoria-error" : undefined}
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((item) => (
                  <option key={item.slug} value={item.slug}>{item.label}</option>
                ))}
              </select>
              <Form.Control.Feedback type="invalid" id="producto-categoria-error">{errores.categoria}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <CampoFormulario id="producto-subcategoria" etiqueta="Subcategoría" name="subcategoria" valor={datos.subcategoria} error={errores.subcategoria} onChange={cambiar} autoComplete="off" />
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <CampoFormulario id="producto-marca" etiqueta="Marca" name="marca" valor={datos.marca} error={errores.marca} onChange={cambiar} autoComplete="off" />
          </Col>
          <Col xs={12} md={6}>
            <CampoFormulario
              id="producto-unidad"
              etiqueta="Unidad de venta"
              name="unidad" valor={datos.unidad} error={errores.unidad} onChange={cambiar}
              ayuda="Por ejemplo: Saco, Unidad, Metro, Caja."
              autoComplete="off"
            />
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <CampoFormulario
              id="producto-precio"
              etiqueta="Precio de lista (CLP)"
              tipo="number"
              min="0"
              step="1"
              inputMode="numeric"
              name="precio" valor={datos.precio} error={errores.precio} onChange={cambiar}
            />
          </Col>
          <Col xs={12} md={6}>
            <CampoFormulario
              id="producto-descuento"
              etiqueta="Descuento (%)"
              tipo="number"
              min="0"
              max="90"
              step="1"
              inputMode="numeric"
              name="descuento" valor={datos.descuento} error={errores.descuento} onChange={cambiar}
              ayuda="0 significa que el producto no está en oferta."
            />
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <CampoFormulario
              id="producto-stock"
              etiqueta="Stock"
              tipo="number"
              min="0"
              step="1"
              inputMode="numeric"
              name="stock" valor={datos.stock} error={errores.stock} onChange={cambiar}
            />
          </Col>
          <Col xs={12} md={6}>
            <CampoFormulario
              id="producto-stock-minimo"
              etiqueta="Stock mínimo (opcional)"
              tipo="number"
              min="0"
              step="1"
              inputMode="numeric"
              name="stockMinimo" valor={datos.stockMinimo} error={errores.stockMinimo} onChange={cambiar}
              ayuda="Con esta cantidad o menos, el producto aparece como stock crítico."
            />
          </Col>
        </Row>

        <CampoFormulario
          id="producto-descripcion"
          etiqueta="Descripción (opcional)"
          como="textarea"
          filas={4}
          name="descripcion" valor={datos.descripcion} error={errores.descripcion} onChange={cambiar}
        />

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary" disabled={guardando}>{guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear producto"}</Button>
          <Link to="/admin/productos" className="btn btn-outline-secondary">Cancelar</Link>
        </div>
      </Form>
    </section>
  );
}

// Formulario de producto, compartido por dos rutas:
//   /admin/productos/nuevo         -> crea un producto
//   /admin/productos/:id/editar    -> edita uno existente
// Si la dirección trae :id (useParams) está en modo edición; si no, en modo creación.
// Props:
//   productos     -> arreglo de productos (para precargar y detectar códigos repetidos)
//   categorias    -> arreglo de { slug, label } para la lista de categorías
//   onCrear       -> recibe el producto completo y lo guarda
//   onActualizar  -> recibe (id, cambios) y guarda los cambios
// Estado propio: los valores, los errores y el mensaje de guardado. Al guardar no se cambia de
// página: se muestra un mensaje con un enlace para volver al listado.
function AdminProductoForm({ productos, categorias, onCrear, onActualizar }) {
  const { id } = useParams();
  const producto = id ? productos.find((actual) => actual.id === id) : null;

  if (id && !producto) {
    return (
      <section>
        <div className="alert alert-warning">
          No encontramos el producto "{id}". <Link to="/admin/productos" className="alert-link">Volver al listado</Link>
        </div>
      </section>
    );
  }

  // key: useState toma los valores iniciales solo la primera vez. Con una key distinta por
  // producto, React descarta el formulario anterior y arma uno nuevo con los datos del otro.
  return (
    <FormularioProducto
      key={id ?? "nuevo"}
      producto={producto}
      productos={productos}
      categorias={categorias}
      onCrear={onCrear}
      onActualizar={onActualizar}
    />
  );
}

export default AdminProductoForm;