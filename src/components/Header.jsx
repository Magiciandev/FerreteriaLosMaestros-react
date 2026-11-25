import { Button, Container, Nav, NavDropdown, Navbar } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";

// Encabezado de la tienda. Props:
//   categorias      lista de categorías, para el menú desplegable (atajo a cada una)
//   cantidadCarrito el número que se muestra en el botón del carrito
//   sesion          el usuario con sesión iniciada ({ correo, rol }) o null
//                   Con sesión: "Ingresar" pasa a ser "Cerrar sesión"; el administrador y el
//                   vendedor además ven el enlace al panel
//   onCerrarSesion  se llama al pulsar "Cerrar sesión"
// El menú principal es corto (Productos, Categorías, Ofertas); Nosotros, Blog y Contacto viven en
// el pie de página. Los enlaces con aspecto de botón son <Link className="btn ...">.
function Header({ categorias, cantidadCarrito = 0, sesion = null, onCerrarSesion }) {
  return (
    <Navbar expand="lg" bg="dark" data-bs-theme="dark" sticky="top" className="encabezado">
      <Container fluid className="px-3 px-lg-4 px-xxl-5">
        <Navbar.Brand as={Link} to="/" className="marca">
          Ferretería Los Maestros
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="menu-principal" aria-label="Abrir o cerrar el menú" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/productos">Productos</Nav.Link>
            <NavDropdown title="Categorías" id="menu-categorias">
              {categorias.map((categoria) => (
                <NavDropdown.Item as={Link} to={`/categorias/${categoria.slug}`} key={categoria.slug}>
                  {categoria.label}
                </NavDropdown.Item>
              ))}
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/categorias">Ver todas</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={NavLink} to="/ofertas">Ofertas</Nav.Link>
            {sesion?.rol === "ADMIN" && <Nav.Link as={NavLink} to="/admin">Administración</Nav.Link>}
            {sesion?.rol === "VENDEDOR" && <Nav.Link as={NavLink} to="/admin">Panel de ventas</Nav.Link>}
          </Nav>
          <div className="acciones-encabezado d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2">
            {sesion ? (
              <Button variant="outline-light" onClick={onCerrarSesion}>Cerrar sesión</Button>
            ) : (
              <Link to="/login" className="btn btn-outline-light">Ingresar</Link>
            )}
            <Link to="/carrito" className="btn btn-primary">
              Carrito <span className="badge text-bg-dark">{cantidadCarrito}</span>
            </Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
