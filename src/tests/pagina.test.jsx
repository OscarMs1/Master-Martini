// Tests simples de la página Master Martini usando Vitest
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import ProductCard from '../components/ProductCard';
import Clases from '../pages/Clases';
import { ShopProvider } from '../contexts/ShopContext';
import { clases } from '../data/clases';
import { Catalog } from '../pages/ShopPages';
import { writeStore } from '../utils/storage';
import { initialProducts } from '../data/catalog';
import {
  netPrice,
  shipping,
  validRun,
  validEmail,
  addCart,
  filteredProducts
} from '../utils/commerce';

// Un producto de ejemplo para usar en los tests
const producto = {
  id: 'TEST-1',
  name: 'Crema de prueba',
  price: 10000,
  discount: 0,
  stock: 5,
  category: 'retail'
};

describe('Funciones de la tienda', () => {
  it('1. netPrice aplica el descuento al precio', () => {
    const conDescuento = { ...producto, discount: 10 };
    expect(netPrice(conDescuento)).toBe(9000);
  });

  it('2. el envío es gratis desde $50.000', () => {
    expect(shipping(60000)).toBe(0);
  });

  it('3. el envío a domicilio cuesta $3.990 si la compra es menor a $50.000', () => {
    expect(shipping(20000)).toBe(3990);
  });

  it('4. validRun acepta un RUN correcto y rechaza uno incorrecto', () => {
    expect(validRun('11.111.111-1')).toBe(true);
    expect(validRun('11.111.111-2')).toBe(false);
  });

  it('5. validEmail revisa que el correo tenga formato válido', () => {
    expect(validEmail('cliente@correo.cl')).toBe(true);
    expect(validEmail('correo-sin-arroba')).toBe(false);
  });

  it('6. addCart suma cantidad sin repetir el producto en el carrito', () => {
    let carrito = addCart([], producto, 1);
    carrito = addCart(carrito, producto, 2);
    expect(carrito.length).toBe(1);
    expect(carrito[0].qty).toBe(3);
  });

  it('7. filteredProducts filtra el catálogo por categoría', () => {
    const resultado = filteredProducts(initialProducts, '', 'gelateria');
    expect(resultado.length).toBeGreaterThan(0);
    resultado.forEach(p => expect(p.category).toBe('gelateria'));
  });
});

describe('Componente ProductCard', () => {
  it('8. muestra el nombre del producto y el botón agregar llama a onAdd', () => {
    const onAdd = vi.fn(); // función falsa para saber si fue llamada
    render(
      <MemoryRouter>
        <ProductCard product={producto} onAdd={onAdd} />
      </MemoryRouter>
    );

    expect(screen.getByText('Crema de prueba')).toBeTruthy();

    fireEvent.click(screen.getByText('Agregar'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});

describe('Página de Clases de recetas', () => {
  it('9. todos los insumos de las clases existen en el catálogo', () => {
    clases.forEach(clase => {
      clase.insumos.forEach(insumo => {
        const producto = initialProducts.find(p => p.id === insumo.id);
        expect(producto).toBeDefined();
      });
    });
  });

  it('10. al inscribirse aparece el mensaje y baja un cupo', () => {
    render(
      <MemoryRouter>
        <ShopProvider>
          <Clases />
        </ShopProvider>
      </MemoryRouter>
    );

    const primeraClase = clases[0];
    expect(screen.getByText(primeraClase.cupos + ' cupos disponibles')).toBeTruthy();

    fireEvent.click(screen.getAllByText('Inscribirme')[0]);

    expect(screen.getByText('¡Estás inscrito en esta clase!')).toBeTruthy();
    expect(screen.getByText(primeraClase.cupos - 1 + ' cupos disponibles')).toBeTruthy();
  });
});

describe('Pruebas con mocks', () => {
  // Antes de cada test dejamos el localStorage vacío
  beforeEach(() => {
    localStorage.clear();
  });

  // Después de cada test quitamos los mocks para que no afecten a otros tests
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete window.__MM_API_ENABLED__;
  });

  it('11. writeStore guarda el carrito en localStorage (spy)', () => {
    // spyOn "espía" la función real para saber con qué datos fue llamada
    const espia = vi.spyOn(Storage.prototype, 'setItem');
    const carrito = [{ id: 'MM-001', qty: 2 }];

    writeStore('mm-ep2-cart', carrito);

    expect(espia).toHaveBeenCalledWith('mm-ep2-cart', JSON.stringify(carrito));
  });

  it('12. el catálogo muestra los productos que llegan desde la API (mock de fetch)', async () => {
    // Producto falso que "responde" la API
    const productoApi = {
      id: 'API-1',
      name: 'Producto desde la API',
      category: 'retail',
      price: 1000,
      stock: 3,
      discount: 0
    };

    // Reemplazamos fetch por una función falsa, así no se llama a un servidor real
    const fetchFalso = vi.fn(url =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(url === '/api/products' ? [productoApi] : [])
      })
    );
    vi.stubGlobal('fetch', fetchFalso);
    window.__MM_API_ENABLED__ = true;

    render(
      <MemoryRouter initialEntries={['/catalogo']}>
        <ShopProvider>
          <Routes>
            <Route path="/catalogo" element={<Catalog />} />
          </Routes>
        </ShopProvider>
      </MemoryRouter>
    );

    // findByText espera a que aparezca el texto (la respuesta es asíncrona)
    expect(await screen.findByText('Producto desde la API')).toBeTruthy();
    expect(fetchFalso).toHaveBeenCalledWith('/api/products', expect.anything());
  });

  it('13. el filtro Online de la página de clases muestra solo clases online', () => {
    render(
      <MemoryRouter>
        <ShopProvider>
          <Clases />
        </ShopProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Online' }));

    const clasesOnline = clases.filter(clase => clase.modalidad === 'Online');
    expect(screen.getAllByTestId('clase-card').length).toBe(clasesOnline.length);
    expect(screen.queryByText('Presencial', { selector: 'span' })).toBeNull();
  });
});
