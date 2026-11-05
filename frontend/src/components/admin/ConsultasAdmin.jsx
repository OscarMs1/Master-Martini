import { dinero } from "../../utils/comercio";
export default function ConsultasAdmin({ tab, registros }) {
  return (
    <>
          {!registros.length ? (
            <p className="state-box">No hay registros todavía.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <caption>Consulta de {tab}</caption>
                <thead>
                  <tr>
                    {(tab === "usuarios"
                      ? ["ID", "Nombre", "Correo", "Rol"]
                      : tab === "pedidos"
                        ? ["ID", "Cliente", "Estado", "Total", "Detalle"]
                        : tab === "inscripciones"
                          ? ["ID", "Usuario ID", "Clase", "Fecha"]
                          : ["ID", "Nombre", "Correo", "Asunto y mensaje"]
                    ).map((t) => (
                      <th scope="col" key={t}>
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registros.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      {tab === "usuarios" ? (
                        <>
                          <td>{row.nombre}</td>
                          <td>{row.email}</td>
                          <td>{row.rol}</td>
                        </>
                      ) : tab === "pedidos" ? (
                        <>
                          <td>
                            {row.nombre}
                            <small className="d-block">{row.email}</small>
                          </td>
                          <td>{row.estado}</td>
                          <td>{dinero(row.total)}</td>
                          <td>
                            <details>
                              <summary>Ver pedido</summary>
                              {row.lineas.map((l) => (
                                <p key={l.productoId}>
                                  {l.cantidad} × {l.nombre}
                                </p>
                              ))}
                              <p>
                                {row.direccion}, {row.comuna}
                                <br />
                                {row.entrega}
                              </p>
                            </details>
                          </td>
                        </>
                      ) : tab === "inscripciones" ? (
                        <>
                          <td>{row.usuarioId}</td>
                          <td>{row.titulo}</td>
                          <td>
                            {new Date(row.fechaClase).toLocaleString("es-CL", {
                              timeZone: "America/Santiago",
                            })}
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{row.nombre}</td>
                          <td>{row.email}</td>
                          <td>
                            <strong>{row.asunto}</strong>
                            <p>{row.mensaje}</p>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
    </>
  );
}
