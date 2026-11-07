import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useShop } from "../../context/ShopContext";

const menuLinks = [
  ["/", "Inicio"],
  ["/nosotros", "Nosotros"],
  ["/catalogo", "Productos"],
  ["/ofertas", "Ofertas"],
  ["/clases", "Clases"],
  ["/novedades", "Novedades"],
  ["/contacto", "Contacto"],
];

export default function Header() {
  const toggleRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 48);
  const { user } = useAuth();
  const { items } = useShop();
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const cartCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  // Mismo comportamiento de la barra en todas las rutas.
  // Solo cambia la transparencia: nada de desplazamientos ni reapariciones.
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 48);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    menuRef.current?.querySelector('a')?.focus();
    const close = () => { setOpen(false); toggleRef.current?.focus(); };
    const key = (event) => {
      if (event.key === 'Escape') close();
      if (event.key === 'Tab') {
        const links = [...menuRef.current.querySelectorAll('a'), toggleRef.current];
        const index = links.indexOf(document.activeElement);
        event.preventDefault(); links[(index + (event.shiftKey ? -1 : 1) + links.length) % links.length].focus();
      }
    };
    const resize = () => { if (window.innerWidth >= 992) close(); };
    window.addEventListener('keydown', key); window.addEventListener('resize', resize);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', key); window.removeEventListener('resize', resize); };
  }, [open]);

  function navbar() {
    const menuId = "menu-principal";
    return (
      <nav className="container-xl navbar navbar-expand-lg" aria-label="Navegación principal">
        <Link to="/" className="brand" aria-label="Master Martini, inicio" onClick={() => setOpen(false)}>
          <img src="/assets/logo/master-martini.png" alt="Master Martini" width="180" height="110" />
        </Link>
        <div className={`nav-links ${open ? "is-open" : ""}`} id={menuId} ref={menuRef}>
          {menuLinks.map(([to, label]) => (
            <NavLink end={to === "/"} key={to} to={to} onClick={() => setOpen(false)}>{label}</NavLink>
          ))}
        </div>
        <div className="nav-actions">
          <Link to={user ? "/mi-cuenta" : "/login"} aria-label={user ? "Mi cuenta" : "Iniciar sesión"}>
            <UserRound size={21} />
          </Link>
          <span className="nav-icon-separator" aria-hidden="true" />
          <Link to="/carrito" className="cart-link" aria-label={`Carrito, ${cartCount} productos`}>
            <ShoppingBag size={21} />{cartCount > 0 && <span>{cartCount}</span>}
          </Link>
          <button type="button" ref={toggleRef} className="menu-toggle" onClick={() => setOpen(!open)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} aria-controls={menuId}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
    );
  }

  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <header className={`site-header header-final ${scrolled ? "header-scrolled" : isHome ? "header-transparent" : "header-internal"}`}>
        {navbar()}
      </header>
      {!isHome && <div className="header-space" aria-hidden="true" />}
    </>
  );
}
