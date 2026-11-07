import SubirImagen from "./SubirImagen";
import { useState } from "react";
import Campo from "../Campo";
import { categorias } from "../../data/editorial";
const vacio = {
  nombre: "",
  categoria: "panaderia",
  formato: "",
  descripcion: "",
  precio: 1000,
  descuento: 0,
  stock: 1,
  imagen: "/assets/images/panaderia.jpg",
  destacado: false,
};
export default function FormularioProducto({
  producto,
  guardar,
  cancelar,
  busy,
}) {
  const [data, setData] = useState(producto ? { ...producto } : vacio);
  const [uploading, setUploading] = useState(false);
  function submit(e) {
    e.preventDefault();
    const payload = Object.fromEntries(Object.keys(vacio).map(key => [key, data[key]]));
    // El campo puede estar vacío mientras se edita, pero nunca al guardar.
    guardar({
      ...payload,
      precio: Number(payload.precio),
      descuento: Number(payload.descuento),
      stock: Number(payload.stock),
    });
  }
  function change(e) {
    const { name, type, value } = e.target;
    setData((anterior) => ({
      ...anterior,
      [name]: type === "number" && value !== "" ? Number(value) : value,
    }));
  }
  return (
    <form className="form-panel mb-4" onSubmit={submit}>
      <h2>{producto ? "Editar producto" : "Nuevo producto"}</h2>
      <div className="row">
        {[
          ["nombre", "Nombre"],
          ["formato", "Formato"],
        ].map(([name, label]) => (
          <div className="col-md-6" key={name}>
            <Campo
              name={name}
              label={label}
              required
              maxLength={name === "nombre" ? 120 : 80}
              value={data[name]}
              onChange={change}
            />
          </div>
        ))}
      </div>
      <Campo
        name="categoria"
        label="Línea"
        as="select"
        value={data.categoria}
        onChange={change}
      >
        {categorias.map((c) => (
          <option value={c.id} key={c.id}>
            {c.nombre}
          </option>
        ))}
      </Campo>
      <Campo
        name="descripcion"
        label="Descripción"
        as="textarea"
        rows={3}
        required
        maxLength={1500}
        value={data.descripcion}
        onChange={change}
      />
      <div className="row">
        {[
          ["precio", "Precio CLP", 1, 100000000],
          ["descuento", "Descuento %", 0, 90],
          ["stock", "Stock", 0, 1000000],
        ].map(([name, label, min, max]) => (
          <div className="col-md-4" key={name}>
            <Campo
              name={name}
              label={label}
              type="number"
              required
              min={min}
              max={max}
              step="1"
              value={data[name]}
              onChange={change}
            />
          </div>
        ))}
      </div>
      <SubirImagen value={data.imagen} onChange={imagen => setData(previous => ({ ...previous, imagen }))} onBusy={setUploading} />
      <label className="choice">
        <input
          type="checkbox"
          checked={data.destacado}
          onChange={(e) => setData({ ...data, destacado: e.target.checked })}
        />
        Destacar en inicio
      </label>
      <div className="d-flex gap-3 mt-3">
        <button className="btn btn-primary" disabled={busy || uploading}>
          {busy ? "Guardando…" : "Guardar producto"}
        </button>
        <button
          className="btn btn-outline-primary"
          type="button"
          onClick={cancelar}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
