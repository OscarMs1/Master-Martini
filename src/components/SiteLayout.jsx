import React, {useEffect,useState} from 'react';
import {Link,NavLink,Outlet,useLocation,useNavigate} from 'react-router-dom';
import {Search,ShoppingCart,UserRound,Menu,X,ArrowRight,Instagram,Facebook,MapPin,Mail,Phone,MessageCircle,Truck,ArrowUp} from 'lucide-react';
import {categories} from '../data/catalog';
import {useShop} from '../contexts/ShopContext';

export function Header(){
 const {cartCount,user}=useShop();const [open,setOpen]=useState(false);const [searchOpen,setSearchOpen]=useState(false);const [q,setQ]=useState('');const [categoriesOpen,setCategoriesOpen]=useState(false);const [scrolled,setScrolled]=useState(false);const location=useLocation();const navigate=useNavigate();
 useEffect(()=>{setOpen(false);setSearchOpen(false);setCategoriesOpen(false)},[location.pathname]);
 useEffect(()=>{const check=()=>setScrolled(window.scrollY>45);check();window.addEventListener('scroll',check,{passive:true});return()=>window.removeEventListener('scroll',check)},[]);
 useEffect(()=>{if(!searchOpen&&!categoriesOpen)return;const close=e=>{if(e.key==='Escape'){setSearchOpen(false);setCategoriesOpen(false)}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[searchOpen,categoriesOpen]);
 const isHome=location.pathname==='/';
 const doSearch=e=>{e.preventDefault();navigate('/catalogo'+(q.trim()?'?q='+encodeURIComponent(q.trim()):''));setSearchOpen(false)};
 return <>
  {!isHome&&<div className="topbar"><div className="container topbar-inner"><span><Truck size={14}/> Despachos a todo Chile. Contáctanos por WhatsApp.</span><span className="socials"><a aria-label="Facebook" href="https://www.facebook.com/" target="_blank" rel="noreferrer"><Facebook size={15}/></a><a aria-label="Instagram" href="https://www.instagram.com/" target="_blank" rel="noreferrer"><Instagram size={15}/></a></span></div></div>}
  <header className={'site-header'+(scrolled?' is-scrolled':'')+(isHome?' home-header':'')}><div className="container head-inner">
   <button type="button" className="bare mobile-only" aria-label={open?'Cerrar menú':'Abrir menú'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
   <Link to="/" className="logo-link" aria-label="Ir al inicio"><img src="/assets/brand-logo-transparent.png" alt="Master Martini"/></Link>
   <nav aria-label="Navegación principal" className={'mainnav '+(open?'shown':'')}>
    <NavLink end to="/">Inicio</NavLink>
    <NavLink to="/nosotros">Nosotros</NavLink>
    <div className={'nav-dropdown'+(categoriesOpen?' is-open':'')} onMouseEnter={()=>setCategoriesOpen(true)} onMouseLeave={()=>setCategoriesOpen(false)}>
      <button type="button" className="nav-dropdown-toggle" aria-expanded={categoriesOpen} aria-haspopup="true" aria-controls="nav-category-menu" onClick={()=>setCategoriesOpen(o=>!o)}>Nuestras líneas</button>
      <div id="nav-category-menu" className="nav-dropdown-menu" aria-label="Categorías Master Martini">
        {categories.map(c=><NavLink key={c.id} to={'/categorias/'+c.id} onClick={()=>setCategoriesOpen(false)}>{c.name}</NavLink>)}
        <NavLink className="nav-dropdown-all" to="/catalogo" onClick={()=>setCategoriesOpen(false)}>Catálogo completo <ArrowRight size={14}/></NavLink>
      </div>
    </div>
    <NavLink to="/blog">Novedades</NavLink>
    <NavLink to="/ofertas">Ofertas</NavLink>
    <NavLink to="/contacto">Contacto</NavLink>
    <NavLink to="/catalogo">Tienda</NavLink>
   </nav>
   <div className="head-actions"><button className="bare header-search" aria-label="Abrir búsqueda" aria-expanded={searchOpen} type="button" onClick={()=>setSearchOpen(v=>!v)}><Search/></button><Link to={user?.role==='admin'?'/admin':user?'/mi-cuenta':'/login'} aria-label="Mi cuenta"><UserRound/></Link><Link to="/carrito" className="cart-link" aria-label={`Carrito con ${cartCount} productos`}><ShoppingCart/>{cartCount>0&&<b>{cartCount}</b>}</Link></div>
  </div>{searchOpen&&<form className="fk-search-overlay" role="search" onSubmit={doSearch}><div className="container fk-search-box"><Search size={24}/><input autoFocus type="search" aria-label="Buscar productos" placeholder="¿Qué estás buscando?" value={q} onChange={e=>setQ(e.target.value)}/><button className="btn-orange" type="submit">Buscar <ArrowRight size={17}/></button><button type="button" className="bare" aria-label="Cerrar búsqueda" onClick={()=>setSearchOpen(false)}><X/></button></div></form>}</header>
 </>;
}
export function Footer(){const [email,setEmail]=useState('');const [sent,setSent]=useState(false);const submit=e=>{e.preventDefault();if(email.trim()&&email.includes('@'))setSent(true)};
 return <>
 <section className="fk-newsletter-banner"><div className="container fk-newsletter-grid"><div><span className="fk-eyebrow">MANTENTE AL DÍA</span><h2>Inspiración en tu correo</h2><p>Recibe novedades, recetas y productos de nuestro catálogo.</p></div><form className="fk-newsletter-form" onSubmit={submit}>{!sent?<><label className="visually-hidden" htmlFor="footer-email">Correo electrónico</label><input id="footer-email" type="email" required placeholder="Tu correo electrónico" value={email} onChange={e=>setEmail(e.target.value)}/><button type="submit">Suscribirme <ArrowRight size={18}/></button></>:<p className="fk-newsletter-done" role="status">¡Gracias! Tu correo quedó registrado en esta demostración académica.</p>}</form></div></section>
 <footer className="footer"><div className="container footer-grid">
  <div><div className="fk-footer-logo"><img src="/assets/brand-logo-transparent.png" alt="Master Martini"/></div><p>Ingredientes que inspiran a profesionales de la panadería, pastelería, gelatería y gastronomía.</p><p className="footer-muted">Proyecto académico • Catálogo y compras simuladas.</p></div>
  <div><h4>Explorar</h4><Link to="/">Inicio</Link><Link to="/catalogo">Todos los productos</Link><Link to="/ofertas">Ofertas</Link><Link to="/blog">Recetas y novedades</Link><Link to="/nosotros">Nosotros</Link><Link to="/contacto">Contacto</Link></div>
  <div><h4>Contáctanos</h4><span><MapPin size={15}/> Quilicura, Santiago, Chile</span><span><Phone size={15}/> +56 2 26611700</span><span><Mail size={15}/> clientes@mastermartini.cl</span><span><Truck size={15}/> Despachos a todo Chile</span></div>
  <div><h4>Síguenos</h4><div className="fk-footer-socials"><a href="https://www.facebook.com/" aria-label="Facebook" target="_blank" rel="noreferrer"><Facebook size={20}/></a><a href="https://www.instagram.com/" aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram size={20}/></a></div><h4 className="fk-footer-info-title">Información</h4><Link to="/contacto">Atención al cliente</Link><Link to="/nosotros">Acerca de Master Martini</Link></div>
 </div><div className="footer-bottom"><div className="container">© 2026 Master Martini · Prototipo educativo no oficial <span>Diseño inspirado en Fruitkha · Fullstack II — EP2</span></div></div></footer></>}
export function Layout(){const {toast,loading,apiError}=useShop();const location=useLocation();const [showUp,setShowUp]=useState(false);
 useEffect(()=>{window.scrollTo({top:0,behavior:'auto'});},[location.pathname]);
 useEffect(()=>{const scroll=()=>setShowUp(window.scrollY>700);scroll();window.addEventListener('scroll',scroll,{passive:true});return()=>window.removeEventListener('scroll',scroll)},[]);
 useEffect(()=>{if(!('IntersectionObserver' in window)){document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));return;}const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;const els=[...document.querySelectorAll('.reveal')];if(reduced){els.forEach(el=>el.classList.add('visible'));return;}const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}})},{threshold:.09,rootMargin:'0px 0px -30px 0px'});els.forEach(e=>observer.observe(e));return()=>observer.disconnect()},[location.pathname]);
 return <><Header/><main id="main-content">{loading&&<div className="container py-3" role="status">Cargando catálogo desde la API…</div>}{apiError&&<div className="container inline-alert danger" role="alert">API no disponible: {apiError} Inicia el servidor y recarga la página.</div>}<Outlet/></main><Footer/><a className="float-whatsapp" href="https://wa.me/56226611700" target="_blank" rel="noreferrer" aria-label="Consultar por WhatsApp"><MessageCircle size={27}/></a>{showUp&&<button className="fk-scroll-top" type="button" aria-label="Volver arriba" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}><ArrowUp size={19}/></button>}{toast&&<div role="status" className="toast-global">{toast}</div>}</>}
export function Breadcrumb({title,crumb}){return <div className="breadcrumb-hero"><div className="container"><span>INICIO / {crumb||title}</span><h1>{title}</h1></div></div>}
export function SectionTitle({eyebrow,title,link,linkLabel='Ver todos'}){return <div className="section-header"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2></div>{link&&<Link className="section-link" to={link}>{linkLabel} <ArrowRight size={16}/></Link>}</div>}
