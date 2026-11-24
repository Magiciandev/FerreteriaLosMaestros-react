import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import CampoFormulario from "../../components/CampoFormulario";
import { validarNombreCategoria, validarSlugCategoria } from "../../utils/validacionesCategoria";

// Formulario de categoría, compartido por dos rutas:
//   /admin/categorias/nueva         -> crea una categoría
//   /admin/categorias/:id/editar    -> edita el nombre de una existente
// Si la dirección trae :id (useParams) está en modo edición; si no, en modo creación.
// Props:
//   categorias    -> arreglo de { slug, label } (para precargar y detectar identificadores repetidos)
//   onCrear       -> recibe { slug, label } y lo guarda
//   onActualizar  -> recibe (slug, { label }) y guarda los cambios
// Estado propio: los valores de los campos, los errores y el mensaje de guardado. Como en
// Contacto, los errores se calculan al enviar. Al guardar no se cambia de página: se muestra un
// mensaje con un enlace para volver al listado.
function AdminCategoriaForm({ categorias, onCrear, onActualizar }) {
  const { id } = useParams();
  const editando = Boolean(id);
  const categoria = editando ? categorias.find((actual) => actual.slug === id) : null;

  const [datos, setDatos] = useState({ slug: categoria?.slug ?? "", label: categoria?.label ?? "" });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [errorServidor, setErrorServidor] = useState("");
  const [guardando, setGuardando] = useState(false);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos({ ...datos, [name]: value });
    setMensaje("");
  }

  // Revisa los campos. En edición el identificador no se cambia (los productos lo usan), así que
  // no se valida; al crear, además, no puede repetirse.
  function validar() {
    const errores = { label: validarNombreCategoria(datos.label) };
    if (!editando) {
      errores.slug = validarSlugCategoria(datos.slug);
      if (!errores.slug && categorias.some((actual) => actual.slug === datos.slug.trim())) {
        errores.slug = "Ya existe una categoría con ese identificador.";
      }
    }
    return errores;
  }

  async function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;

    const label = datos.label.trim();
    setGuardando(true);
    setErrorServidor("");
    try {
      if (editando) await onActualizar(categoria.slug, { label });
      else await onCrear({ slug: datos.slug.trim(), label });
      setMensaje(editando ? `La categoría "${label}" se actualizó.` : `La categoría "${label}" se creó.`);
      if (!editando) setDatos({ slug: "", label: "" });
    } catch (error) {
      setErrorServidor(error.message);
    } finally {
      setGuardando(false);
    }
  }

  if (editando && !categoria) {
    return (
      <section>
        <div className="alert alert-warning">
          No encontramos la categoría "{id}". <Link to="/admin/categorias" className="alert-link">Volver al listado</Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="titulo-admin-categoria-form">
      <h1 id="titulo-admin-categoria-form" className="h3 mb-3">
        {editando ? "Editar categoría" : "Nueva categoría"}
      </h1>
      {mensaje && (
        <div className="alert alert-success" role="status">
          {mensaje} <Link to="/admin/categorias" className="alert-link">Volver al listado</Link>
        </div>
      )}
      {errorServidor && <div className="alert alert-danger" role="alert">{errorServidor}</div>}
      <Form noValidate onSubmit={enviar} aria-label="Formulario de categoría" style={{ maxWidth: "32rem" }}>
        <CampoFormulario
          id="categoria-slug"
          etiqueta="Identificador"
          valor={datos.slug}
          error={errores.slug}
          name="slug"
          onChange={cambiar}
          disabled={editando}
          ayuda={
            editando
              ? "No se puede cambiar: los productos y las direcciones de la tienda lo usan."
              : "Aparece en la dirección de la categoría y no se podrá cambiar después."
          }
          autoComplete="off"
        />
        <CampoFormulario
          id="categoria-nombre"
          etiqueta="Nombre"
          valor={datos.label}
          error={errores.label}
          name="label"
          onChange={cambiar}
          autoComplete="off"
        />
        <div className="d-flex gap-2">
          <Button type="submit" variant="primary" disabled={guardando}>{guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear categoría"}</Button>
          <Button as={Link} to="/admin/categorias" variant="outline-secondary">Cancelar</Button>
        </div>
      </Form>
    </section>
  );
}

export default AdminCategoriaForm;