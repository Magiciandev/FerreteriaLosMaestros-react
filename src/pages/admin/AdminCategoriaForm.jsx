import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import CampoFormulario from "../../components/CampoFormulario";
import { validarNombreCategoria, validarSlugCategoria } from "../../utils/validacionesCategoria";

// Cada campo con su regla de validación (utils/validacionesCategoria.js).
const VALIDADORES = {
  slug: validarSlugCategoria,
  label: validarNombreCategoria,
};

// Formulario de categoría, compartido por dos rutas:
//   /admin/categorias/nueva         -> crea una categoría
//   /admin/categorias/:id/editar    -> edita el nombre de una existente
// Si la dirección trae :id (useParams) está en modo edición; si no, en modo creación.
// Props:
//   categorias    -> arreglo de { slug, label } (para precargar y detectar identificadores repetidos)
//   onCrear       -> recibe { slug, label } y lo guarda
//   onActualizar  -> recibe (slug, { label }) y guarda los cambios
// Estado propio: los valores de los campos y los errores. Igual que en Contacto, los errores
// aparecen al salir de un campo (onBlur) y se quitan apenas el valor es válido.
function AdminCategoriaForm({ categorias, onCrear, onActualizar }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const editando = Boolean(id);
  const categoria = editando ? categorias.find((actual) => actual.slug === id) : null;

  const [datos, setDatos] = useState({ slug: categoria?.slug ?? "", label: categoria?.label ?? "" });
  const [errores, setErrores] = useState({});

  // En edición el identificador no se cambia (los productos lo usan), así que no se valida.
  const campos = editando ? ["label"] : ["slug", "label"];

  // Regla del campo + comprobación de que el identificador no esté repetido.
  function errorDe(campo, valor) {
    const error = VALIDADORES[campo](valor);
    if (error) return error;
    if (campo === "slug" && categorias.some((actual) => actual.slug === valor.trim())) {
      return "Ya existe una categoría con ese identificador.";
    }
    return "";
  }

  function cambiar(campo) {
    return (evento) => {
      const valor = evento.target.value;
      setDatos((actual) => ({ ...actual, [campo]: valor }));
      if (errores[campo]) setErrores((actual) => ({ ...actual, [campo]: errorDe(campo, valor) }));
    };
  }

  function salirDeCampo(campo) {
    return () => setErrores((actual) => ({ ...actual, [campo]: errorDe(campo, datos[campo]) }));
  }

  function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = {};
    for (const campo of campos) nuevosErrores[campo] = errorDe(campo, datos[campo]);
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;

    const label = datos.label.trim();
    try {
      if (editando) onActualizar(categoria.slug, { label });
      else onCrear({ slug: datos.slug.trim(), label });
    } catch (error) {
      // crear() lanza un error si el identificador ya existe en la base de datos simulada.
      setErrores({ slug: error.message });
      return;
    }
    navigate("/admin/categorias", {
      state: { mensaje: editando ? `La categoría "${label}" se actualizó.` : `La categoría "${label}" se creó.` },
    });
  }

  if (editando && !categoria) {
    return (
      <section>
        <Alert variant="warning">
          No encontramos la categoría "{id}". <Alert.Link as={Link} to="/admin/categorias">Volver al listado</Alert.Link>
        </Alert>
      </section>
    );
  }

  return (
    <section aria-labelledby="titulo-admin-categoria-form">
      <h1 id="titulo-admin-categoria-form" className="h3 mb-3">
        {editando ? "Editar categoría" : "Nueva categoría"}
      </h1>
      <Form noValidate onSubmit={enviar} aria-label="Formulario de categoría" style={{ maxWidth: "32rem" }}>
        <CampoFormulario
          id="categoria-slug"
          etiqueta="Identificador"
          valor={datos.slug}
          error={errores.slug}
          onChange={cambiar("slug")}
          onBlur={salirDeCampo("slug")}
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
          onChange={cambiar("label")}
          onBlur={salirDeCampo("label")}
          autoComplete="off"
        />
        <div className="d-flex gap-2">
          <Button type="submit" variant="primary">{editando ? "Guardar cambios" : "Crear categoría"}</Button>
          <Button as={Link} to="/admin/categorias" variant="outline-secondary">Cancelar</Button>
        </div>
      </Form>
    </section>
  );
}

export default AdminCategoriaForm;