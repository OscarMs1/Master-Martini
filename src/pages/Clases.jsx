import { useState } from 'react';
import { Link } from 'react-router';
import { CalendarDays, Clock, MapPin, ShoppingCart, Users, CheckCircle2 } from 'lucide-react';
import { Breadcrumb, SectionTitle } from '../components/SiteLayout';
import { useShop } from '../contexts/ShopContext';
import { clases } from '../data/clases';
import { money, netPrice } from '../utils/commerce';
import '../styles/clases.css';

export default function Clases() {
  const { products, add } = useShop();

  // Filtro: 'Todas', 'Presencial' u 'Online'
  const [filtro, setFiltro] = useState('Todas');

  // Lista con los id de las clases en que el usuario se inscribió
  const [inscritas, setInscritas] = useState([]);

  const clasesFiltradas = clases.filter(clase => filtro === 'Todas' || clase.modalidad === filtro);

  function inscribirse(id) {
    setInscritas([...inscritas, id]);
  }

  // Busca un producto del catálogo por su id
  function buscarProducto(id) {
    return products.find(producto => producto.id === id);
  }

  // Agrega al carrito todos los insumos de una clase
  function agregarInsumos(clase) {
    clase.insumos.forEach(insumo => {
      const producto = buscarProducto(insumo.id);
      if (producto) {
        add(producto, insumo.cantidad);
      }
    });
  }

  return (
    <>
      <Breadcrumb title="Clases de recetas" crumb="CLASES" />
      <section className="section">
        <div className="container">
          <SectionTitle
            eyebrow="APRENDE CON NOSOTROS"
            title="Clases con productos de nuestro catálogo"
          />

          <div className="clases-filtros">
            {['Todas', 'Presencial', 'Online'].map(opcion => (
              <button
                key={opcion}
                type="button"
                className={filtro === opcion ? 'activo' : ''}
                onClick={() => setFiltro(opcion)}
              >
                {opcion}
              </button>
            ))}
          </div>

          {/* Grilla de Bootstrap: 1 columna en celular (col-12) y 2 columnas desde tablet (col-md-6) */}
          <div className="row g-4">
            {clasesFiltradas.map(clase => {
              const estaInscrito = inscritas.includes(clase.id);
              const cuposLibres = estaInscrito ? clase.cupos - 1 : clase.cupos;

              return (
                <div className="col-12 col-md-6" key={clase.id}>
                  <article className="clase-card h-100" data-testid="clase-card">
                    <img src={clase.imagen} alt={clase.titulo} />

                    <div className="clase-info">
                      <span className={'clase-etiqueta ' + clase.modalidad.toLowerCase()}>
                        {clase.modalidad}
                      </span>
                      <h3>{clase.titulo}</h3>
                      <p>{clase.descripcion}</p>

                      <ul className="clase-datos row g-2">
                        <li className="col-12 col-sm-6">
                          <CalendarDays size={16} /> {clase.fecha}
                        </li>
                        <li className="col-12 col-sm-6">
                          <Clock size={16} /> {clase.hora} · {clase.duracion}
                        </li>
                        <li className="col-12 col-sm-6">
                          <MapPin size={16} /> {clase.lugar}
                        </li>
                        <li className="col-12 col-sm-6">
                          <Users size={16} /> {cuposLibres} cupos disponibles
                        </li>
                      </ul>

                      <h4>Receta · nivel {clase.nivel}</h4>
                      <ol>
                        {clase.pasos.map(paso => (
                          <li key={paso}>{paso}</li>
                        ))}
                      </ol>

                      <div className="clase-insumos">
                        <h4>Insumos de esta receta</h4>
                        {clase.insumos.map(insumo => {
                          const producto = buscarProducto(insumo.id);
                          if (!producto) return null;
                          return (
                            <div className="insumo" key={insumo.id}>
                              <img src={producto.image} alt="" />
                              <Link to={'/producto/' + producto.id}>{producto.name}</Link>
                              <span>
                                {insumo.cantidad} x {money(netPrice(producto))}
                              </span>
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() => agregarInsumos(clase)}
                        >
                          <ShoppingCart size={16} /> Agregar insumos al carrito
                        </button>
                      </div>

                      {estaInscrito ? (
                        <p className="clase-ok">
                          <CheckCircle2 size={18} /> ¡Estás inscrito en esta clase!
                        </p>
                      ) : (
                        <button
                          type="button"
                          className="btn-orange"
                          onClick={() => inscribirse(clase.id)}
                        >
                          Inscribirme
                        </button>
                      )}
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
