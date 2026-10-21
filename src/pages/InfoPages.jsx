import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowRight, MapPin, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { posts } from '../data/catalog';
import { Breadcrumb, SectionTitle } from '../components/SiteLayout';
import { Field, Alert } from '../components/FormFields';
import { validateContact, hasErrors } from '../utils/commerce';
export function About() {
  return (
    <>
      <Breadcrumb title="Conoce Master Martini" crumb="NOSOTROS" />
      <section className="section">
        <div className="container detail-grid">
          <div className="about-image">
            <img
              src="/assets/panaderia-profesional.jpg"
              alt="Profesional elaborando productos de panadería"
            />
          </div>
          <div className="detail-info">
            <span className="eyebrow">CALIDAD E INNOVACIÓN</span>
            <h2>Ingredientes para crear algo extraordinario</h2>
            <p>
              Master Martini Chile es parte de Unigra, compañía italiana que ofrece ingredientes y
              soluciones para panadería, pastelería, heladería, food service y retail.
            </p>
            <p>
              Esta tienda es una <strong>demostración educativa no oficial</strong>, desarrollada en
              React para la evaluación parcial 2 de Fullstack II. No representa un canal de ventas
              autorizado.
            </p>
            <Link to="/catalogo" className="btn-orange">
              Explorar soluciones <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
export function Blog() {
  return (
    <>
      <Breadcrumb title="Recetas y novedades" crumb="BLOG" />
      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="INSPÍRATE" title="Ideas para seguir creando" />
          <div className="blog-grid">
            {posts.map(p => (
              <Link to={'/blog/' + p.slug} className="blog-card" key={p.slug}>
                <img src={p.cardImage || p.image} alt="" />
                <div>
                  <small>{p.tag}</small>
                  <h3>{p.name}</h3>
                  <p>{p.desc}</p>
                  <span>
                    Leer artículo <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
export function BlogDetail() {
  const { slug } = useParams();
  const p = posts.find(x => x.slug === slug);
  if (!p)
    return (
      <>
        <Breadcrumb title="Artículo no encontrado" />
        <div className="container section">
          <Link to="/blog">Volver a blog</Link>
        </div>
      </>
    );
  return (
    <>
      <Breadcrumb title={p.name} crumb="BLOG" />
      <section className="section">
        <article className="container article">
          <img src={p.image} alt={p.name} />
          <span className="eyebrow">{p.tag}</span>
          <h2>{p.name}</h2>
          <p className="lead">{p.desc}</p>
          <p>{p.text}</p>
          <p>
            Descubre más ingredientes, tendencias y técnicas que inspiran recetas y productos
            innovadores. El contenido de este artículo es una muestra académica.
          </p>
          <Link className="btn-outline" to="/blog">
            ← Volver a novedades
          </Link>
        </article>
      </section>
    </>
  );
}
export function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  // Actualiza un solo campo del formulario
  const updateField = (key, value) => setFormData({ ...formData, [key]: value });

  const handleSubmit = event => {
    event.preventDefault();
    const newErrors = validateContact(formData);
    setErrors(newErrors);
    if (!hasErrors(newErrors)) setSent(true);
  };
  return (
    <>
      <Breadcrumb title="Contáctanos" crumb="CONTACTO" />
      <section className="section">
        <div className="container contact-grid">
          <div>
            <span className="eyebrow">ESTAMOS PARA AYUDARTE</span>
            <h2>Hablemos de tu próximo proyecto</h2>
            <p>Escríbenos para recibir información sobre nuestras líneas de productos.</p>
            <div className="contact-info">
              <div>
                <MapPin />
                <p>
                  <b>Dirección</b>Avenida Américo Vespucio 1385, Centro SpacioFlex, Módulo 3.
                  Quilicura, Santiago.
                </p>
              </div>
              <div>
                <Phone />
                <p>
                  <b>Teléfono</b>+56 2 26611700
                </p>
              </div>
              <div>
                <Mail />
                <p>
                  <b>Correo</b>clientes@mastermartini.cl
                </p>
              </div>
            </div>
            <p className="demo-note">
              * Información corporativa tomada de la web pública; formulario no conectado a sus
              servidores.
            </p>
          </div>
          <form className="form-panel" onSubmit={handleSubmit} noValidate>
            <h3>Déjanos un mensaje</h3>
            {sent ? (
              <Alert type="success">
                <CheckCircle2 size={18} /> Mensaje simulado enviado con éxito. No se envió correo
                real.
              </Alert>
            ) : (
              <>
                <Field
                  label="Nombre *"
                  name="name"
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                  error={errors.name}
                />
                <Field
                  label="Correo *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={e => updateField('email', e.target.value)}
                  error={errors.email}
                />
                <Field
                  label="Asunto *"
                  name="subject"
                  value={formData.subject}
                  onChange={e => updateField('subject', e.target.value)}
                  error={errors.subject}
                />
                <Field
                  label="Mensaje *"
                  name="message"
                  as="textarea"
                  rows="5"
                  value={formData.message}
                  onChange={e => updateField('message', e.target.value)}
                  error={errors.message}
                />
                <button className="btn-orange btn-block">
                  Enviar consulta (demo) <ArrowRight size={16} />
                </button>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
export function NotFound() {
  return (
    <>
      <Breadcrumb title="Página no encontrada" />
      <section className="section">
        <div className="container empty-state">
          <p className="error-code">404</p>
          <h2>Esta página no existe</h2>
          <p>Regresa al inicio para continuar explorando.</p>
          <Link className="btn-orange" to="/">
            Volver al inicio
          </Link>
        </div>
      </section>
    </>
  );
}
