import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Home from '../pages/Home';
import App from '../App';
import ErrorBoundary from '../components/ErrorBoundary';
import { ShopProvider } from '../contexts/ShopContext';

function media(matches = false) {
  const listeners = new Set();
  const query = { matches, addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn) };
  vi.stubGlobal('matchMedia', vi.fn(() => query));
  return value => { query.matches = value; act(() => listeners.forEach(fn => fn())); };
}
const home = () => render(<MemoryRouter><ShopProvider><Home /></ShopProvider></MemoryRouter>);
const hero = () => screen.getByRole('region', { name: 'Presentación de Master Martini' });
const slide = n => within(hero()).getByRole('button', { name: new RegExp(`Ir a diapositiva ${n}:`) });
afterEach(() => { vi.useRealTimers(); window.history.replaceState({}, '', '/'); });

describe('Inicio, temporizadores y accesibilidad del carrusel', () => {
  it('H01 avanza automáticamente y pausa por foco, pestaña oculta y movimiento reducido', () => {
    vi.useFakeTimers(); const setReduced = media();
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    const view = home();
    expect(slide(1).getAttribute('aria-current')).toBe('true');
    act(() => vi.advanceTimersByTime(6200));
    expect(slide(2).getAttribute('aria-current')).toBe('true');
    fireEvent.focus(slide(2)); act(() => vi.advanceTimersByTime(6200));
    expect(slide(2).getAttribute('aria-current')).toBe('true');
    fireEvent.blur(slide(2), { relatedTarget: slide(1) });
    act(() => vi.advanceTimersByTime(6200));
    expect(slide(2).getAttribute('aria-current')).toBe('true');
    fireEvent.blur(slide(2), { relatedTarget: document.body });
    hidden.mockReturnValue(true); act(() => vi.advanceTimersByTime(6200));
    expect(slide(2).getAttribute('aria-current')).toBe('true');
    hidden.mockReturnValue(false); act(() => vi.advanceTimersByTime(6200));
    expect(slide(3).getAttribute('aria-current')).toBe('true');
    setReduced(true); act(() => vi.advanceTimersByTime(12400));
    expect(slide(3).getAttribute('aria-current')).toBe('true');
    expect(view.container.querySelector('.fk-slide-progress')).toBeNull();
    view.unmount(); expect(vi.getTimerCount()).toBe(0);
  });
  it('H02 navega mediante teclado y puntos, manteniendo enlace y foto de cada diapositiva', () => {
    media(true); const view = home();
    expect(view.container.querySelector('.fk-hero-image.active').style.backgroundImage).toContain('/assets/Portada.jpg');
    fireEvent.keyDown(hero(), { key:'ArrowLeft' });
    expect(slide(3).getAttribute('aria-current')).toBe('true');
    fireEvent.keyDown(hero(), { key:'ArrowRight' });
    expect(slide(1).getAttribute('aria-current')).toBe('true');
    fireEvent.click(slide(2));
    expect(within(hero()).getByRole('link',{name:'Panadería y pastelería'}).getAttribute('href')).toBe('/categorias/panaderia');
    fireEvent.keyDown(hero(), { key:'Tab' });
    expect(slide(2).getAttribute('aria-current')).toBe('true');
  });
  it('H03 filtra destacados y agrega la promoción al carrito real', () => {
    media(true); home();
    fireEvent.click(within(screen.getByRole('group',{name:'Filtrar productos'})).getByRole('button',{name:'Gelatería'}));
    expect(screen.getAllByTestId('product-card')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button',{name:'Añadir al carrito'}));
    expect(JSON.parse(localStorage.getItem('mm-ep2-cart'))).toEqual([{id:'MM-004',qty:1}]);
  });
  it('H04 maneja catálogo vacío y recurso de respaldo sin ofrecer una compra inexistente', () => {
    media(true); localStorage.setItem('mm-ep2-products','[]'); const view = home();
    expect(screen.getByText('No hay productos en esta categoría.')).toBeTruthy();
    expect(screen.queryByRole('button',{name:'Añadir al carrito'})).toBeNull();
    const image = view.container.querySelector('.fk-deal-image img');
    fireEvent.error(image); expect(image.getAttribute('src')).toBe('/assets/prod-orasi.png');
  });
  it('H05 cuenta regresiva actualiza segundos y se detiene en cero', () => {
    vi.useFakeTimers(); media(true); home();
    const countdown=screen.getByLabelText('Tiempo restante de la promoción de muestra');
    const before=countdown.textContent;
    act(()=>vi.advanceTimersByTime(1000)); expect(countdown.textContent).not.toBe(before);
    vi.setSystemTime(Date.now()+10*24*60*60*1000);
    act(()=>vi.advanceTimersByTime(1000));
    expect([...countdown.querySelectorAll('strong')].map(x=>x.textContent)).toEqual(['00','00','00','00']);
  });
  it('H06 diálogo abre y cierra por Escape, botón, fondo y navegación', () => {
    media(true); home();
    const open=()=>fireEvent.click(screen.getByRole('button',{name:'Conocer la historia de Master Martini'}));
    open(); fireEvent.mouseDown(screen.getByRole('dialog')); expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.keyDown(window,{key:'Escape'}); expect(screen.queryByRole('dialog')).toBeNull();
    open(); fireEvent.click(screen.getByRole('button',{name:'Cerrar'})); expect(screen.queryByRole('dialog')).toBeNull();
    open(); fireEvent.mouseDown(screen.getByRole('presentation')); expect(screen.queryByRole('dialog')).toBeNull();
    open(); fireEvent.click(screen.getByRole('link',{name:/Ir a Nosotros/})); expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('Aplicación completa, rutas y recuperación', () => {
  beforeEach(()=> { media(true); vi.stubGlobal('scrollTo',vi.fn()); });
  it('H07 navega de inicio a categoría, detalle inexistente y página desconocida', async () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('link',{name:'Gelatería',exact:true})[0]);
    expect(await screen.findByRole('heading',{name:'Gelatería',level:1})).toBeTruthy();
    expect(screen.getAllByTestId('product-card')).toHaveLength(2);
    act(()=> { window.history.pushState({},'', '/producto/no-existe'); window.dispatchEvent(new PopStateEvent('popstate')); });
    expect(await screen.findByText('No existe el producto solicitado.')).toBeTruthy();
    act(()=> { window.history.pushState({},'', '/ruta-inexistente'); window.dispatchEvent(new PopStateEvent('popstate')); });
    expect(await screen.findByRole('heading',{name:'Esta página no existe'})).toBeTruthy();
    fireEvent.click(screen.getByRole('link',{name:'Volver al inicio'}));
    expect(await screen.findByRole('region',{name:'Presentación de Master Martini'})).toBeTruthy();
  });
  it('H08 abre una novedad y vuelve al listado, manejando artículo inexistente', async () => {
    window.history.replaceState({},'', '/blog'); render(<App />);
    const article=screen.getAllByRole('link').find(x=>x.getAttribute('href')?.startsWith('/blog/'));
    fireEvent.click(article);
    expect(await screen.findByRole('link',{name:/Volver a novedades/})).toBeTruthy();
    fireEvent.click(screen.getByRole('link',{name:/Volver a novedades/}));
    expect(await screen.findByRole('heading',{name:'Recetas y novedades',level:1})).toBeTruthy();
    act(()=> { window.history.pushState({},'', '/blog/no-existe'); window.dispatchEvent(new PopStateEvent('popstate')); });
    expect(await screen.findByRole('heading',{name:'Artículo no encontrado'})).toBeTruthy();
  });
  it('H09 revela contenido con IntersectionObserver y permite volver arriba', () => {
    let notify; const unobserve=vi.fn(), disconnect=vi.fn();
    vi.stubGlobal('IntersectionObserver',class { constructor(fn){notify=fn;} observe(){} unobserve=unobserve; disconnect=disconnect; });
    media(false); const view=render(<App />);
    const reveal=view.container.querySelector('.reveal');
    act(()=>notify([{isIntersecting:false,target:reveal}])); expect(reveal.classList.contains('visible')).toBe(false);
    act(()=>notify([{isIntersecting:true,target:reveal}])); expect(reveal.classList.contains('visible')).toBe(true);
    expect(unobserve).toHaveBeenCalledWith(reveal);
    vi.spyOn(window,'scrollY','get').mockReturnValue(800); fireEvent.scroll(window);
    fireEvent.click(screen.getByRole('button',{name:'Volver arriba'}));
    expect(window.scrollTo).toHaveBeenCalledWith({top:0,behavior:'smooth'});
    view.unmount(); expect(disconnect).toHaveBeenCalled();
  });
  it('H10 muestra error de render y ofrece recarga; sin error conserva los hijos', () => {
    const errorLog=vi.spyOn(console,'error').mockImplementation(()=>{});
    function Broken(){throw new Error('Fallo controlado');}
    const healthy=render(<ErrorBoundary><p>Contenido disponible</p></ErrorBoundary>);
    expect(screen.getByText('Contenido disponible')).toBeTruthy(); healthy.unmount();
    const reload=vi.fn(); vi.stubGlobal('location',{reload});
    render(<ErrorBoundary><Broken /></ErrorBoundary>);
    expect(screen.getByRole('alert').textContent).toContain('Fallo controlado');
    expect(errorLog).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'Recargar página'}));
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
