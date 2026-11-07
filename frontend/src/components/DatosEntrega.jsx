import Campo from "./Campo";
import { comunasDeRegion, regionesChile } from "../data/regionesComunasChile";
export const entregaVacia = {
  nombre: "",
  email: "",
  run: "",
  telefono: "",
  region: "",
  comuna: "",
  direccion: "",
};
export default function DatosEntrega({ data, onChange, errors }) {
  const fields = [
    ["nombre", "Nombre completo", "name"],
    ["email", "Correo electrónico", "email"],
    ["run", "RUN", "off"],
    ["telefono", "Teléfono", "tel"],
    ["region", "Región", "address-level1"],
    ["comuna", "Comuna", "address-level2"],
    ["direccion", "Dirección", "street-address"],
  ];
  const comunas = comunasDeRegion(data.region);
  return (
    <div className="row">
      {fields.map(([name, label, autoComplete]) => (
        <div
          className={name === "direccion" ? "col-12" : "col-md-6"}
          key={name}
        >
          {name === "region" || name === "comuna" ? (
            <div className="mb-3">
              <label className="form-label" htmlFor={`campo-${name}`}>
                {label}
              </label>
              <select
                id={`campo-${name}`}
                name={name}
                className={`form-select ${errors?.[name] ? "is-invalid" : ""}`}
                autoComplete={autoComplete}
                value={data[name] || ""}
                onChange={onChange}
                aria-invalid={!!errors?.[name]}
                aria-describedby={errors?.[name] ? `campo-${name}-error` : undefined}
                disabled={name === "comuna" && !comunas.length}
                required
              >
                <option value="">
                  {name === "region"
                    ? "Selecciona una región"
                    : comunas.length
                      ? "Selecciona una comuna"
                      : "Selecciona primero una región"}
                </option>
                {(name === "region" ? regionesChile : comunas).map((opcion) => (
                  <option key={opcion} value={opcion}>{opcion}</option>
                ))}
              </select>
              {errors?.[name] && (
                <div className="invalid-feedback" id={`campo-${name}-error`}>
                  {errors[name]}
                </div>
              )}
            </div>
          ) : (
            <Campo
              name={name}
              label={label}
              autoComplete={autoComplete}
              type={
                name === "email" ? "email" : name === "telefono" ? "tel" : "text"
              }
              value={data[name]}
              onChange={onChange}
              error={errors?.[name]}
              required
              maxLength={name === "direccion" ? 200 : 120}
            />
          )}
        </div>
      ))}
    </div>
  );
}
