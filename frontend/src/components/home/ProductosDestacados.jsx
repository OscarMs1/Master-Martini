import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import TarjetaProducto from "../productos/TarjetaProducto";
import Estado from "../Estado";
export default function ProductosDestacados() {
  const { productos, loading, error, agregar, recargar } = useShop();
  return (
    <section className="section container-xl home-featured">
      <div className="section-heading">
        <div>
          <p className="eyebrow">LA SELECCIÓN DE LA CASA</p>
          <h2>
            Pequeños ingredientes.
            <br />
            <em>Grandes resultados.</em>
          </h2>
        </div>
        <Link className="text-link" to="/catalogo">
          Ver todo el catálogo <ArrowRight size={18} />
        </Link>
      </div>
      <Estado loading={loading} error={error} retry={recargar}>
        <div className="row g-4">
          {productos
            .filter((p) => p.destacado)
            .slice(0, 4)
            .map((p) => (
              <div className="col-sm-6 col-lg-3" key={p.id}>
                <TarjetaProducto producto={p} onAgregar={agregar} />
              </div>
            ))}
        </div>
      </Estado>

    </section>
  );
}
