import { Search } from "lucide-react";
import { categorias } from "../../data/editorial";
export default function Filtros({ categoria, buscar, orden, onChange }) {
  return (
    <div className="catalog-filters">
      <div className="search-field">
        <Search size={18} />
        <input
          aria-label="Buscar productos"
          value={buscar}
          onChange={(e) => onChange("buscar", e.target.value)}
          placeholder="¿Qué necesitas para crear?"
        />
      </div>
      <div className="row g-3">
        <div className="col-sm-6">
          <label className="form-label" htmlFor="categoria">
            Línea de productos
          </label>
          <select
            id="categoria"
            className="form-select"
            value={categoria}
            onChange={(e) => onChange("categoria", e.target.value)}
          >
            <option value="">Todas las líneas</option>
            {categorias.map((c) => (
              <option value={c.id} key={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-sm-6">
          <label className="form-label" htmlFor="orden">
            Ordenar por
          </label>
          <select
            id="orden"
            className="form-select"
            value={orden}
            onChange={(e) => onChange("orden", e.target.value)}
          >
            <option value="destacados">Destacados</option>
            <option value="menor">Menor precio</option>
            <option value="mayor">Mayor precio</option>
            <option value="nombre">Nombre A–Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}
