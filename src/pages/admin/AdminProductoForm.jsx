import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import CampoFormulario from "../../components/CampoFormulario";
import { useFormulario } from "../../hooks/useFormulario";
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
  const navigate = useNavigate();
  const editando = Boolean(producto);

  // Cada campo con su regla (utils/validaciones.js). El código además no puede repetirse, y eso
  // solo se sabe mirando la lista de productos, por eso este validador se arma aquí.
  const validadores = {
    id: (valor) => {
      const error = validarCodigoProducto(valor);
      if (error) return error;
      const repetido = productos.some((actual) => actual.id.toLowerCase() === valor.trim().toLowerCase());
      return !editando && repetido ? "Ya existe un producto con ese código." : "";
    },
    nombre: validarNombreProducto,
    categoria: validarCategoria,
    subcategoria: validarTextoCorto("La subcategoría"),
    marca: validarTextoCorto("La marca"),
    unidad: validarTextoCorto("La unidad"),
    precio: validarPrecio,
    descuento: validarDescuento,
    stock: validarStock,
    stockMinimo: validarStockMinimo,
    descripcion: validarDescripcionProducto,
  };
  const formulario = useFormulario(valoresIniciales(producto), validadores);
  const { datos, errores } = formulario;
  const categoriaCampo = formulario.campo("categoria");

  function enviar(evento) {
    evento.preventDefault();
    if (!formulario.validarTodo()) return;

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

    try {
      // Al editar, actualizar() mezcla los cambios sobre el producto, así que conserva la
      // imagen y el código. Al crear, el código se guarda en mayúsculas como los existentes.
      if (editando) onActualizar(producto.id, cambios);
      else onCrear({ ...cambios, id: datos.id.trim().toUpperCase(), imagen: null });
    } catch (error) {
      // crear() lanza un error si el código ya existe en la base de datos simulada.
      formulario.ponerError("id", error.message);
      return;
    }
    navigate("/admin/productos", {
      state: { mensaje: `El producto "${cambios.nombre}" se ${editando ? "actualizó" : "creó"}.` },
    });
  }

  return (
    <section aria-labelledby="titulo-admin-producto-form">
      <h1 id="titulo-admin-producto-form" className="h3 mb-3">
        {editando ? "Editar producto" : "Nuevo producto"}
      </h1>
      <Form noValidate onSubmit={enviar} aria-label="Formulario de producto" style={{ maxWidth: "48rem" }}>
        <Row>
          <Col xs={12} md={4}>
            <CampoFormulario
              id="producto-codigo"
              etiqueta="Código"
              {...formulario.campo("id")}
              disabled={editando}
              ayuda={editando ? "No se puede cambiar: las órdenes y el carrito lo usan." : "Mínimo 3 caracteres, por ejemplo MC090."}
              autoComplete="off"
            />
          </Col>
          <Col xs={12} md={8}>
            <CampoFormulario id="producto-nombre" etiqueta="Nombre" {...formulario.campo("nombre")} autoComplete="off" />
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            {/* La categoría es una lista porque solo puede ser una de las que existen. */}
            <Form.Group className="mb-3" controlId="producto-categoria">
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                value={datos.categoria}
                onChange={categoriaCampo.onChange}
                onBlur={categoriaCampo.onBlur}
                isInvalid={Boolean(errores.categoria)}
                aria-describedby={errores.categoria ? "producto-categoria-error" : undefined}
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((item) => (
                  <option key={item.slug} value={item.slug}>{item.label}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid" id="producto-categoria-error">{errores.categoria}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <CampoFormulario id="producto-subcategoria" etiqueta="Subcategoría" {...formulario.campo("subcategoria")} autoComplete="off" />
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <CampoFormulario id="producto-marca" etiqueta="Marca" {...formulario.campo("marca")} autoComplete="off" />
          </Col>
          <Col xs={12} md={6}>
            <CampoFormulario
              id="producto-unidad"
              etiqueta="Unidad de venta"
              {...formulario.campo("unidad")}
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
              {...formulario.campo("precio")}
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
              {...formulario.campo("descuento")}
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
              {...formulario.campo("stock")}
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
              {...formulario.campo("stockMinimo")}
              ayuda="Con esta cantidad o menos, el producto aparece como stock crítico."
            />
          </Col>
        </Row>

        <CampoFormulario
          id="producto-descripcion"
          etiqueta="Descripción (opcional)"
          como="textarea"
          filas={4}
          {...formulario.campo("descripcion")}
        />

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary">{editando ? "Guardar cambios" : "Crear producto"}</Button>
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
// Estado propio: los valores y errores de los campos, que maneja useFormulario.
function AdminProductoForm({ productos, categorias, onCrear, onActualizar }) {
  const { id } = useParams();
  const producto = id ? productos.find((actual) => actual.id === id) : null;

  if (id && !producto) {
    return (
      <section>
        <Alert variant="warning">
          No encontramos el producto "{id}". <Alert.Link as={Link} to="/admin/productos">Volver al listado</Alert.Link>
        </Alert>
      </section>
    );
  }

  // key: useFormulario toma los valores iniciales solo la primera vez. Con una key distinta por
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