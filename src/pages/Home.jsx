import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Truck,
  Headphones,
  BadgeCheck,
  Play,
  ShoppingCart,
  X
} from 'lucide-react';
import { categories, posts } from '../data/catalog';
import { useShop } from '../contexts/ShopContext';
import ProductCard from '../components/ProductCard';

// Slider de estilo Fruitkha, reimplementado en React sin jQuery/Owl.
const heroSlides = [
  {
    eyebrow: 'INGREDIENTES QUE INSPIRAN',
    title: ['Ingredientes para', 'grandes creaciones'],
    description:
      'Descubre soluciones para panadería, pastelería, gelatería y food service con la calidad de Master Martini.',
    image: '/assets/hero-panaderia-artesanal.jpg',
    position: 'center center',
    overlay: 'rgba(0,0,0,.39)',
    button: 'Ver catálogo',
    to: '/catalogo'
  },
  {
    eyebrow: 'TRADICIÓN E INNOVACIÓN',
    title: 'Pasión por la panadería profesional',
    description: '',
    image: '/assets/panaderia-profesional.jpg',
    position: 'center 47%',
    overlay: 'rgba(0,0,0,.28)',
    button: 'Panadería y pastelería',
    to: '/categorias/panaderia'
  },
  {
    eyebrow: 'INSPIRACIÓN ITALIANA',
    title: 'Una solución para cada especialidad',
    description:
      'Ingredientes, sabores, texturas y soluciones profesionales para gelatería artesanal y de negocio.',
    image: '/assets/hero-gelato-artesanal.jpg',
    position: 'center 48%',
    overlay: 'rgba(0,0,0,.33)',
    button: 'Descubrir nuestras líneas',
    to: '/catalogo'
  }
];
const initialDeadline = Date.now() + ((3 * 24 + 8) * 60 * 60 + 24 * 60 + 37) * 1000;
function getRemaining(end) {
  const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
  return [
    Math.floor(s / 86400),
    Math.floor((s % 86400) / 3600),
    Math.floor((s % 3600) / 60),
    s % 60
  ];
}
const pad = n => String(n).padStart(2, '0');
function useCountdown() {
  const deadline = useRef(initialDeadline);
  const [units, setUnits] = useState(() => getRemaining(deadline.current));
  useEffect(() => {
    const timer = window.setInterval(() => setUnits(getRemaining(deadline.current)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return units;
}

function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);
  useEffect(() => {
    if (paused || reduceMotion) return;
    const t = window.setInterval(() => {
      if (!document.hidden) setIndex(i => (i + 1) % heroSlides.length);
    }, 6200);
    return () => window.clearInterval(t);
  }, [paused, reduceMotion]);
  useEffect(() => {
    heroSlides.forEach(s => {
      const img = new Image();
      img.src = s.image;
    });
  }, []);
  const goto = i => setIndex((i + heroSlides.length) % heroSlides.length);
  const s = heroSlides[index];
  return (
    <section
      className="fk-hero"
      aria-label="Presentación de Master Martini"
      aria-roledescription="carrusel"
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={e => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
      onKeyDown={e => {
        if (e.key === 'ArrowLeft') goto(index - 1);
        if (e.key === 'ArrowRight') goto(index + 1);
      }}
    >
      <div className="fk-hero-backgrounds" aria-hidden="true">
        {heroSlides.map((slide, i) => (
          <div
            key={slide.image}
            className={'fk-hero-image' + (i === index ? ' active' : '')}
            style={{
              backgroundImage: `linear-gradient(${slide.overlay || 'rgba(0,0,0,.45)'},${slide.overlay || 'rgba(0,0,0,.45)'}),url("${slide.image}")`,
              backgroundPosition: slide.position
            }}
          />
        ))}
      </div>
      <div className="container fk-hero-content">
        <div className="fk-hero-center" key={index} aria-live="polite" aria-atomic="true">
          <span className="fk-eyebrow fk-animate-subtitle">{s.eyebrow}</span>
          <h1 className="fk-animate-title">
            {Array.isArray(s.title)
              ? s.title.map((line, i) => <span key={i}>{line}</span>)
              : s.title}
          </h1>
          {s.description && <p className="fk-animate-desc">{s.description}</p>}
          <div className="fk-hero-actions fk-animate-actions">
            <Link className="btn-orange btn-large" to={s.to}>
              {s.button}
            </Link>
            <Link to="/contacto" className="fk-outline-btn">
              Contáctanos
            </Link>
          </div>
        </div>
      </div>
      <div className="fk-hero-dots" aria-label="Seleccionar diapositiva">
        {heroSlides.map((v, i) => (
          <button
            key={v.title}
            type="button"
            aria-label={`Ir a diapositiva ${i + 1}: ${Array.isArray(v.title) ? v.title.join(' ') : v.title}`}
            aria-current={i === index ? 'true' : undefined}
            className={i === index ? 'active' : ''}
            onClick={() => goto(i)}
          />
        ))}
      </div>
      {!reduceMotion && (
        <div
          key={index}
          className="fk-slide-progress"
          aria-hidden="true"
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
        />
      )}
    </section>
  );
}
function Benefits() {
  return (
    <div className="fk-benefits">
      <div className="container fk-benefits-grid">
        {[
          { icon: Truck, name: 'Cobertura nacional', info: 'Despachos a todo Chile' },
          {
            icon: Headphones,
            name: 'Asesoría especializada',
            info: 'Te acompañamos en tu negocio'
          },
          { icon: BadgeCheck, name: 'Calidad profesional', info: 'Ingredientes para grandes ideas' }
        ].map(({ icon: Icon, name, info }) => (
          <div className="fk-benefit" key={name}>
            <span className="fk-benefit-icon">
              <Icon size={28} strokeWidth={1.9} />
            </span>
            <div>
              <strong>{name}</strong>
              <p>{info}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function HomeHeading({ first, rest, subtitle }) {
  return (
    <div className="fk-heading reveal">
      <h2>
        <span>{first}</span> {rest}
      </h2>
      <div className="fk-heading-line" />
      <p>{subtitle}</p>
    </div>
  );
}
function FeaturedProducts() {
  const { products, add } = useShop();
  const [selected, setSelected] = useState('all');
  const catList = [{ id: 'all', name: 'Todos' }, ...categories];
  const filtered = (
    selected === 'all'
      ? products.filter(p => p.featured)
      : products.filter(p => p.category === selected)
  ).slice(0, 3);
  return (
    <section className="fk-products" id="productos">
      <div className="container">
        <HomeHeading
          first="Nuestros"
          rest="productos"
          subtitle="Descubre una selección de nuestras soluciones para profesionales. Productos y precios de demostración."
        />
        <div className="fk-product-filters reveal" role="group" aria-label="Filtrar productos">
          {catList.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={selected === cat.id ? 'active' : ''}
              aria-pressed={selected === cat.id}
              onClick={() => setSelected(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="fk-product-grid" key={selected}>
          {filtered.map((p, i) => (
            <div key={p.id} className="fk-product-item">
              <ProductCard product={p} onAdd={add} />
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center muted">No hay productos en esta categoría.</p>
        )}
        <p className="fk-disclaimer">
          * Precios, descuentos y stock ilustrativos para fines académicos.
        </p>
        <div className="text-center mt-4">
          <Link className="fk-plain-link" to="/catalogo">
            Ver catálogo completo <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
function MonthDeal() {
  const units = useCountdown();
  const { products, add } = useShop();
  const deal = products.find(p => p.id === 'MM-004') || products.find(p => p.discount > 0);
  return (
    <section className="fk-deal">
      <div className="container fk-deal-grid">
        <div className="fk-deal-image reveal">
          <img
            loading="lazy"
            src={deal?.remoteImage || deal?.image || '/assets/prod-orasi.png'}
            onError={e => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/assets/prod-orasi.png';
            }}
            alt={deal?.name || 'Producto destacado'}
          />
          <span className="fk-deal-badge">
            <b>{deal?.discount || 15}%</b>
            <span>de descuento</span>
          </span>
        </div>
        <div className="fk-deal-copy reveal">
          <span className="fk-eyebrow">PROMOCIONES DEL CATÁLOGO</span>
          <h2>
            <span>Oferta</span> del mes
          </h2>
          <h3>{deal?.name || 'Ofertas del catálogo'}</h3>
          <p>
            Explora bebidas vegetales, cremas e ingredientes para crear nuevas experiencias. Esta
            promoción es demostrativa, sin venta real.
          </p>
          <div className="fk-countdown" aria-label="Tiempo restante de la promoción de muestra">
            {units.map((value, i) => (
              <div key={i}>
                <strong>{pad(value)}</strong>
                <span>{['Días', 'Horas', 'Min', 'Seg'][i]}</span>
              </div>
            ))}
          </div>
          <div className="fk-deal-actions">
            <Link to="/ofertas" className="btn-orange">
              <ArrowRight size={17} /> Ver todas las ofertas
            </Link>
            {deal && (
              <button type="button" className="fk-text-button" onClick={() => add(deal)}>
                <ShoppingCart size={17} /> Añadir al carrito
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
function Specialties() {
  return (
    <section className="fk-specialties">
      <div className="container">
        <HomeHeading
          first="Para cada"
          rest="especialidad"
          subtitle="Desde el primer amasado hasta el último detalle: encuentra soluciones para cada tipo de negocio."
        />
        <div className="fk-categories-grid">
          {categories.map((c, i) => (
            <Link
              to={'/categorias/' + c.id}
              className="fk-specialty-card reveal"
              key={c.id}
              style={{ transitionDelay: `${i * 75}ms` }}
            >
              <div className="fk-specialty-image">
                <img loading="lazy" src={c.image} alt={c.name} />
              </div>
              <div className="fk-specialty-body">
                <h3>{c.name}</h3>
                <p>{c.subtitle}</p>
                <span>
                  Descubrir productos <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
function OurStory() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!show) return;
    const onKey = e => {
      if (e.key === 'Escape') setShow(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show]);
  return (
    <>
      <section className="fk-about">
        <div className="container fk-about-grid">
          <div className="fk-about-image reveal">
            <img
              loading="lazy"
              src="/assets/panaderia-profesional.jpg"
              alt="Elaboración de pan artesanal"
            />
            <button
              aria-label="Conocer la historia de Master Martini"
              type="button"
              className="fk-play"
              onClick={() => setShow(true)}
            >
              <Play size={30} fill="currentColor" />
            </button>
          </div>
          <div className="fk-about-copy reveal">
            <span className="fk-eyebrow">TRADICIÓN E INNOVACIÓN</span>
            <h2>
              Ingredientes que inspiran <span>grandes resultados.</span>
            </h2>
            <p>
              Master Martini forma parte del grupo italiano Unigrà y acompaña a profesionales de la
              panadería, pastelería, gelatería y gastronomía con soluciones y marcas especializadas.
            </p>
            <p>Ideas, ingredientes y experiencia para inspirarte en cada creación.</p>
            <Link to="/nosotros" className="btn-orange">
              Conocer más <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
      {show && (
        <div
          className="fk-modal"
          role="presentation"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setShow(false);
          }}
        >
          <div
            className="fk-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-title"
          >
            <button
              type="button"
              className="fk-modal-close"
              onClick={() => setShow(false)}
              aria-label="Cerrar"
            >
              <X />
            </button>
            <img
              src="/assets/panaderia-profesional.jpg"
              alt="Preparación profesional de panadería"
            />
            <div>
              <span className="fk-eyebrow">NUESTRA HISTORIA</span>
              <h2 id="story-title">Ingredientes para grandes creaciones</h2>
              <p>
                Master Martini ofrece soluciones profesionales para panadería, pastelería, gelatería
                y food service. Descubre nuestra historia en la sección Nosotros.
              </p>
              <Link onClick={() => setShow(false)} to="/nosotros" className="btn-orange">
                Ir a Nosotros <ArrowRight size={16} />
              </Link>
              <p className="fk-modal-note">
                Presentación informativa. No se incluye un vídeo promocional oficial.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
function InspirationBanner() {
  return (
    <section className="fk-inspire-banner">
      <div className="container reveal">
        <span className="fk-eyebrow">CREA SIN LÍMITES</span>
        <h2>
          Más posibilidades
          <br />
          en cada preparación
        </h2>
        <p>Descubre soluciones para profesionales que buscan calidad, rendimiento e innovación.</p>
        <Link to="/catalogo" className="btn-orange">
          Ver catálogo <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}
function News() {
  return (
    <section className="fk-news">
      <div className="container">
        <HomeHeading
          first="Recetas"
          rest="y novedades"
          subtitle="Ideas, técnicas e inspiración para continuar creando y sorprender a tus clientes."
        />
        <div className="fk-news-grid">
          {posts.map((post, i) => (
            <Link
              to={'/blog/' + post.slug}
              className="fk-news-card reveal"
              style={{ transitionDelay: `${i * 80}ms` }}
              key={post.slug}
            >
              <div className="fk-news-photo">
                <img src={post.cardImage || post.image} alt={post.name} loading="lazy" />
              </div>
              <div className="fk-news-content">
                <h3>{post.name}</h3>
                <div className="fk-news-meta">{post.tag} · MASTER MARTINI</div>
                <p>{post.desc}</p>
                <span>
                  Leer más <ArrowRight size={17} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
function BrandRibbon() {
  return (
    <div className="fk-brand-strip" aria-label="Nuestras marcas y líneas">
      <div className="fk-brand-track">
        {Array.from({ length: 2 }, (_, i) => (
          <div className="fk-brand-set" key={i} aria-hidden={i === 1}>
            {[
              'Master Martini',
              'Martini Gelato',
              'Gran Master',
              'OraSì',
              'Bravo Crem',
              'Monna Lisa'
            ].map(n => (
              <span key={n}>{n}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
export default function Home() {
  return (
    <>
      <Hero />
      <Benefits />
      <FeaturedProducts />
      <MonthDeal />
      <Specialties />
      <OurStory />
      <InspirationBanner />
      <News />
      <BrandRibbon />
    </>
  );
}
