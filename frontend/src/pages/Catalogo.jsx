import { useSearchParams } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import Filtros from "../components/productos/Filtros";
import TarjetaProducto from "../components/productos/TarjetaProducto";
import Estado from "../components/Estado";
import { filtrarProductos } from "../utils/comercio";
export default function Catalogo({ soloOfertas = false }) {
  const { productos, loading, error, agregar, recargar } = useShop();
  const [params, setParams] = useSearchParams();
  const categoria = params.get("categoria") || "",
    buscar = params.get("buscar") || "",
    orden = params.get("orden") || "destacados";
  const result = filtrarProductos(
    soloOfertas ? productos.filter((p) => p.descuento > 0) : productos,
    categoria,
    buscar,
    orden,
  );
  function cambiar(key, value) {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  }
  return (
    <>
      <section className="page-heading">
        <div className="container-xl">
          <p className="eyebrow">
            {soloOfertas ? "OPORTUNIDADES PARA CREAR" : "NUESTROS INGREDIENTES"}
          </p>
          <h1>
            {soloOfertas ? (
              <>
                Una selección <em>especial.</em>
              </>
            ) : (
              <>
                El comienzo de tu
                <br />
                <em>próxima creación.</em>
              </>
            )}
          </h1>
          <p>
            Explora ingredientes para tu cocina, tu vitrina y tus nuevas ideas.
          </p>
        </div>
      </section>
      <section className="container-xl section pt-5">
        <Filtros
          categoria={categoria}
          buscar={buscar}
          orden={orden}
          onChange={cambiar}
        />
        <div className="catalog-count">
          <span>{result.length} productos</span>
          <span>Valores en pesos chilenos</span>
        </div>
        <Estado loading={loading} error={error} retry={recargar}>
          {result.length ? (
            <div className="row g-4">
              {result.map((p) => (
                <div className="col-sm-6 col-lg-4 col-xl-3" key={p.id}>
                  <TarjetaProducto producto={p} onAgregar={agregar} />
                </div>
              ))}
            </div>
          ) : (
            <div className="state-box">
              <h2>No encontramos productos</h2>
              <p>Prueba otra búsqueda o explora todas nuestras líneas.</p>
              <button
                className="btn btn-outline-primary"
                onClick={() => setParams({})}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </Estado>

      </section>
    </>
  );
}
