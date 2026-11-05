import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import RutaProtegida from "./components/RutaProtegida";
import Home from "./pages/Home";
import Nosotros from "./pages/Nosotros";
import Catalogo from "./pages/Catalogo";
import DetalleProducto from "./pages/DetalleProducto";
import Ofertas from "./pages/Ofertas";
import Clases from "./pages/Clases";
import Novedades from "./pages/Novedades";
import DetalleNovedad from "./pages/DetalleNovedad";
import Contacto from "./pages/Contacto";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import MiCuenta from "./pages/MiCuenta";
import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import ResultadoCompra from "./pages/ResultadoCompra";
import Admin from "./pages/Admin";
import Creditos from "./pages/Creditos";
import NoEncontrado from "./pages/NoEncontrado";
export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = `${pathname === "/" ? "Ingredientes para crear" : pathname.split("/")[1].replaceAll("-", " ")} · Master Martini`;
    document.getElementById("contenido")?.focus({ preventScroll: true });
  }, [pathname]);
  return (
    <>
      <Header />
      <main id="contenido" tabIndex="-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/producto/:id" element={<DetalleProducto />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/clases" element={<Clases />} />
          <Route path="/novedades" element={<Novedades />} />
          <Route path="/novedades/:slug" element={<DetalleNovedad />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/mi-cuenta"
            element={
              <RutaProtegida>
                <MiCuenta />
              </RutaProtegida>
            }
          />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/resultado-compra" element={<ResultadoCompra />} />
          <Route
            path="/admin"
            element={
              <RutaProtegida admin>
                <Admin />
              </RutaProtegida>
            }
          />
          <Route path="/creditos" element={<Creditos />} />
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
