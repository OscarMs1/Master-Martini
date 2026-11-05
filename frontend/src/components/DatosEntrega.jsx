import Campo from "./Campo";
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
  return (
    <div className="row">
      {fields.map(([name, label, autoComplete]) => (
        <div
          className={name === "direccion" ? "col-12" : "col-md-6"}
          key={name}
        >
          <Campo
            name={name}
            label={label}
            autoComplete={autoComplete}
            type={
              name === "email" ? "email" : name === "telefono" ? "tel" : "text"
            }
            value={data[name]}
            onChange={onChange}
            error={errors[name]}
            required
            maxLength={name === "direccion" ? 200 : 120}
          />
        </div>
      ))}
    </div>
  );
}
