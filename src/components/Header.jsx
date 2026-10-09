import { useState } from "react";
import { Badge, Button, Container, Form, Nav, NavDropdown, Navbar } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";

// Encabezado de la tienda.
// Props:
//   categorias       -> arreglo { slug, label } para el menú desplegable
//   cantidadCarrito  -> número que se muestra en el botón del carrito
//   sesion           -> null (visitante) o { nombre, tipo, rol } (usuario con sesión)
//   onCerrarSesion   -> función que ejecuta App cuando se pulsa "Cerrar sesión"
// Estado propio: el texto del buscador (solo le importa a este componente).
//
// Menú principal reducido a lo esencial (Productos, Categorías, Ofertas). Nosotros, Blog y
// Contacto viven en el pie de página. Con sesión iniciada, las acciones de la cuenta se
// agrupan en un solo menú desplegable.
// Los botones que navegan son <Link className="btn ..."> y no <Button as={Link}>, porque
// react-bootstrap les pondría role="button" y un lector de pantalla los anunciaría como
// botón en vez de como enlace.
function Header({ categorias = [], cantidadCarrito = 0, sesion = null, onCerrarSesion }) {
  const [texto, setTexto] = useState("");
  const navigate = useNavigate();

  function buscar(evento) {
    evento.preventDefault();
    const consulta = texto.trim();
    navigate(consulta ? `/productos?q=${encodeURIComponent(consulta)}` : "/productos");
  }

  const primerNombre = sesion?.nombre?.split(" ")[0];

  return (
    <Navbar expand="lg" bg="dark" data-bs-theme="dark" sticky="top" className="encabezado">
      <Container>
        <Navbar.Brand as={Link} to="/" className="marca">
          Ferretería Los Maestros
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="menu-principal" aria-label="Abrir o cerrar el menú" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/productos">Productos</Nav.Link>
            <NavDropdown title="Categorías" id="menu-categorias">
              {categorias.map((categoria) => (
                <NavDropdown.Item
                  as={Link}
                  to={`/categorias/${categoria.slug}`}
                  key={categoria.slug}
                >
                  {categoria.label}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
            <Nav.Link as={NavLink} to="/ofertas">Ofertas</Nav.Link>
          </Nav>

          <Form className="d-flex my-2 my-lg-0 me-lg-3" role="search" onSubmit={buscar}>
            <Form.Control
              type="search"
              placeholder="Buscar productos"
              aria-label="Buscar productos"
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              className="me-2"
            />
            <Button type="submit" variant="outline-light">Buscar</Button>
          </Form>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <Link to="/carrito" className="btn btn-primary">
              Carrito <Badge bg="dark" text="light">{cantidadCarrito}</Badge>
            </Link>
            {sesion ? (
              <Nav>
                <NavDropdown title={`Hola, ${primerNombre}`} id="menu-cuenta" align="end">
                  <NavDropdown.Item as={Link} to="/perfil">Mi perfil</NavDropdown.Item>
                  {sesion.tipo === "empleado" && (
                    <NavDropdown.Item as={Link} to="/admin">Panel de administración</NavDropdown.Item>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item as="button" onClick={onCerrarSesion}>Cerrar sesión</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light">Iniciar sesión</Link>
                <Link to="/registro" className="btn btn-primary">Crear cuenta</Link>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
