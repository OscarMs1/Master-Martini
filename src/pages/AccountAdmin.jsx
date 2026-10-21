import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { Package, Users, ClipboardList, Plus, ShieldCheck, LogOut, RotateCcw } from 'lucide-react';
import { Breadcrumb } from '../components/SiteLayout';
import { Field, Alert } from '../components/FormFields';
import ProductForm from '../components/admin/ProductForm';
import ProductTable from '../components/admin/ProductTable';
import OrderList from '../components/admin/OrderList';
import { useShop } from '../contexts/ShopContext';
import { regions } from '../data/catalog';
import { clases } from '../data/clases';
import { validateRegister, validateProduct, hasErrors } from '../utils/commerce';
import { readStore, writeStore } from '../utils/storage';

// Cuentas de prueba para la demostración.
// En un sistema real, las contraseñas se validan en el backend y nunca en el frontend.
const demoAccounts = [
  { email: 'admin@demo.cl', password: 'Admin123', name: 'Administrador Demo', role: 'admin' },
  { email: 'vendedor@demo.cl', password: 'Venta123', name: 'Vendedor Demo', role: 'vendedor' },
  { email: 'cliente@demo.cl', password: 'Cliente123', name: 'Cliente Demo', role: 'cliente' }
];

// Devuelve true si el usuario puede entrar al panel de administración
function canUseAdmin(user) {
  return user?.role === 'admin' || user?.role === 'vendedor';
}

export function Login() {
  const { setUser } = useShop();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = event => {
    event.preventDefault();
    const account = demoAccounts.find(
      item => item.email === email.trim().toLowerCase() && item.password === password
    );
    if (!account) {
      setError('Credenciales inválidas. Revisa los usuarios ficticios de la demostración.');
      return;
    }
    // Guardamos el usuario sin la contraseña
    const loggedUser = { name: account.name, email: account.email, role: account.role };
    setUser(loggedUser);
    navigate(canUseAdmin(loggedUser) ? '/admin' : '/mi-cuenta');
  };

  return (
    <>
      <Breadcrumb title="Iniciar sesión" />
      <section className="section">
        <div className="container narrow">
          <div className="form-panel">
            <h2>Bienvenido de nuevo</h2>
            <p className="muted">
              Accede con un usuario de prueba. No utilices credenciales personales.
            </p>
            <form onSubmit={handleSubmit}>
              <Field
                name="email"
                label="Correo electrónico"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Field
                name="password"
                label="Contraseña"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {error && <Alert type="danger">{error}</Alert>}
              <button className="btn-orange btn-block">Entrar a mi cuenta</button>
            </form>
            <div className="demo-creds">
              <b>Accesos para la defensa:</b>
              <p>
                Administrador: <code>admin@demo.cl</code> / <code>Admin123</code>
              </p>
              <p>
                Vendedor: <code>vendedor@demo.cl</code> / <code>Venta123</code>
              </p>
              <p>
                Cliente: <code>cliente@demo.cl</code> / <code>Cliente123</code>
              </p>
            </div>
            <p className="text-center mt-3">
              ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
export function Register() {
  const { setUser } = useShop();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    run: '',
    email: '',
    phone: '',
    region: '',
    commune: '',
    address: '',
    password: '',
    confirm: ''
  });

  // Actualiza un campo. Si cambia la región, se borra la comuna elegida.
  const updateField = (key, value) => {
    const newData = { ...formData, [key]: value };
    if (key === 'region') newData.commune = '';
    setFormData(newData);
  };

  const handleSubmit = event => {
    event.preventDefault();
    const newErrors = validateRegister(formData);
    setErrors(newErrors);
    if (hasErrors(newErrors)) return;

    // La contraseña NO se guarda: es un registro de prototipo, sin backend.
    const newClient = {
      name: formData.name + ' ' + formData.lastName,
      email: formData.email,
      run: formData.run,
      phone: formData.phone,
      region: formData.region,
      commune: formData.commune,
      address: formData.address,
      role: 'cliente'
    };
    const otherClients = readStore('mm-ep2-clients', []).filter(
      client => client.email !== newClient.email
    );
    writeStore('mm-ep2-clients', [...otherClients, newClient]);
    setUser(newClient);
    navigate('/mi-cuenta');
  };

  return (
    <>
      <Breadcrumb title="Crear una cuenta" />
      <section className="section">
        <div className="container narrow-wide">
          <form className="form-panel" onSubmit={handleSubmit} noValidate>
            <h2>Registro de cliente</h2>
            <p className="muted">
              Formulario React con validación, RUN chileno y comunas dependientes de la región.
            </p>
            {/* Bootstrap: 1 columna en celular, 2 desde tablet (col-md-6) */}
            <div className="row gx-4">
              <Field
                col="col-md-6"
                name="name"
                label="Nombre *"
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
                error={errors.name}
              />
              <Field
                col="col-md-6"
                name="lastName"
                label="Apellido *"
                value={formData.lastName}
                onChange={e => updateField('lastName', e.target.value)}
                error={errors.lastName}
              />
              <Field
                col="col-md-6"
                name="run"
                label="RUN *"
                placeholder="12.345.678-5"
                value={formData.run}
                onChange={e => updateField('run', e.target.value)}
                error={errors.run}
              />
              <Field
                col="col-md-6"
                name="email"
                label="Correo *"
                type="email"
                value={formData.email}
                onChange={e => updateField('email', e.target.value)}
                error={errors.email}
              />
              <Field
                col="col-md-6"
                name="phone"
                label="Teléfono"
                value={formData.phone}
                onChange={e => updateField('phone', e.target.value)}
              />
              <Field
                col="col-md-6"
                name="address"
                label="Dirección *"
                value={formData.address}
                onChange={e => updateField('address', e.target.value)}
                error={errors.address}
              />
              <Field
                col="col-md-6"
                name="region"
                label="Región *"
                as="select"
                value={formData.region}
                onChange={e => updateField('region', e.target.value)}
                error={errors.region}
              >
                <option value="">Seleccionar región</option>
                {Object.keys(regions).map(region => (
                  <option key={region}>{region}</option>
                ))}
              </Field>
              <Field
                col="col-md-6"
                name="commune"
                label="Comuna *"
                as="select"
                value={formData.commune}
                onChange={e => updateField('commune', e.target.value)}
                error={errors.commune}
              >
                <option value="">Seleccionar comuna</option>
                {(regions[formData.region] || []).map(commune => (
                  <option key={commune}>{commune}</option>
                ))}
              </Field>
              <Field
                col="col-md-6"
                name="password"
                label="Contraseña (4 a 10 caracteres) *"
                type="password"
                value={formData.password}
                onChange={e => updateField('password', e.target.value)}
                error={errors.password}
              />
              <Field
                col="col-md-6"
                name="confirm"
                label="Confirmar contraseña *"
                type="password"
                value={formData.confirm}
                onChange={e => updateField('confirm', e.target.value)}
                error={errors.confirm}
              />
            </div>
            <p className="small muted">
              Importante: registro ilustrativo. La contraseña no se persiste; para iniciar sesión
              después usa las cuentas demo.
            </p>
            <button className="btn-orange btn-block">Registrarme</button>
          </form>
        </div>
      </section>
    </>
  );
}
export function MyAccount() {
  const { user, setUser, orders, enrolledClasses } = useShop();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  // Solo los pedidos de este usuario
  const myOrders = orders.filter(order => order.userId === user.email);
  // Las clases de recetas en que se inscribió (vienen del estado global)
  const myClasses = clases.filter(clase => enrolledClasses.includes(clase.id));

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <>
      <Breadcrumb title="Mi cuenta" />
      <section className="section">
        <div className="container">
          <div className="account-row">
            <div>
              <span className="eyebrow">ÁREA PERSONAL</span>
              <h2>Hola, {user.name}</h2>
              <p>
                {user.email} · Rol: {user.role}
              </p>
            </div>
            <button className="btn-outline" onClick={handleLogout}>
              <LogOut size={17} /> Cerrar sesión
            </button>
          </div>
          {canUseAdmin(user) && (
            <Link to="/admin" className="btn-orange">
              Abrir administración
            </Link>
          )}
          <h3 className="mt-4">Mis pedidos de demostración</h3>
          <OrderList
            orders={myOrders}
            showDate
            emptyMessage="Todavía no hay pedidos asociados a esta cuenta."
          />

          <h3 className="mt-4">Mis clases de recetas</h3>
          {myClasses.length === 0 ? (
            <p className="muted">
              Aún no te inscribes en ninguna clase. <Link to="/clases">Ver clases</Link>
            </p>
          ) : (
            <div className="order-list">
              {myClasses.map(clase => (
                <div className="order-line" key={clase.id}>
                  <b>{clase.titulo}</b>
                  <span>{clase.fecha}</span>
                  <span>{clase.hora}</span>
                  <span>{clase.modalidad}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// Si el usuario no puede usar el panel, lo manda al login
export function ProtectedAdmin({ children }) {
  const { user } = useShop();
  if (!canUseAdmin(user)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const emptyProduct = {
  id: '',
  name: '',
  brand: 'Master Martini',
  category: 'panaderia',
  format: '1 kg',
  description: '',
  price: 0,
  stock: 0,
  discount: 0,
  image: '/assets/producto-respaldo.svg',
  featured: false
};

const adminTabs = [
  { key: 'productos', icon: Package, label: 'Productos' },
  { key: 'pedidos', icon: ClipboardList, label: 'Pedidos' },
  { key: 'usuarios', icon: Users, label: 'Usuarios' }
];

export function Admin() {
  const { products, orders, user, saveProduct, eraseProduct, resetCatalog } = useShop();
  const [tab, setTab] = useState('productos');
  // editingId: null = viendo la tabla, 'new' = producto nuevo, o el id del producto que se edita
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const clients = readStore('mm-ep2-clients', []);
  const isNew = editingId === 'new';
  const lowStockCount = products.filter(product => product.stock < 5).length;
  const filteredProducts = products.filter(product =>
    (product.name + product.id).toLowerCase().includes(search.toLowerCase())
  );
  // Usuarios de prueba (sin contraseña) + clientes registrados
  const allUsers = [
    ...demoAccounts.map(account => ({
      name: account.name,
      email: account.email,
      role: account.role
    })),
    ...clients
  ];

  const startEditing = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setForm({ ...product });
    } else {
      setEditingId('new');
      setForm({ ...emptyProduct, id: 'MM-' + String(Date.now()).slice(-6) });
    }
    setErrors({});
    setMessage('');
  };

  const updateField = (key, value) => {
    const newForm = { ...form, [key]: value };
    // Si cambia la imagen, se olvida la imagen remota anterior
    if (key === 'image') {
      newForm.remoteImage = undefined;
      newForm.imageNote = undefined;
    }
    setForm(newForm);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const newErrors = validateProduct(form);
    setErrors(newErrors);
    if (hasErrors(newErrors)) return;

    // Los inputs entregan texto, así que se pasan a número antes de guardar
    const product = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      discount: Number(form.discount)
    };
    try {
      await saveProduct(product, !isNew);
      setMessage(isNew ? 'Producto creado correctamente.' : 'Producto actualizado.');
      setEditingId(null);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm(`¿Eliminar producto ${id}?`)) return;
    try {
      await eraseProduct(id);
      setMessage('Producto eliminado.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('¿Restaurar productos y borrar carrito demo?')) return;
    try {
      await resetCatalog();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const changeTab = key => {
    setTab(key);
    setEditingId(null);
  };

  return (
    <>
      <Breadcrumb title="Panel administrativo" crumb="SISTEMA ADMINISTRATIVO" />
      <section className="section admin-section">
        <div className="container">
          <div className="admin-welcome">
            <div>
              <span className="eyebrow">PANEL DE CONTROL</span>
              <h2>Hola, {user.name}</h2>
              <p>
                Gestiona el inventario y consulta los datos de la aplicación (simulación local).
              </p>
            </div>
            <span className="admin-badge">
              <ShieldCheck size={16} /> {user.role}
            </span>
          </div>

          <div className="admin-stats">
            <div>
              <Package />
              <b>{products.length}</b>
              <span>Productos</span>
            </div>
            <div>
              <ClipboardList />
              <b>{orders.length}</b>
              <span>Pedidos registrados</span>
            </div>
            <div>
              <Users />
              <b>{allUsers.length}</b>
              <span>Usuarios de prueba</span>
            </div>
            <div>
              <Package />
              <b>{lowStockCount}</b>
              <span>Stock crítico</span>
            </div>
          </div>

          <div className="admin-shell">
            <aside className="admin-sidebar">
              <h3>Administración</h3>
              {adminTabs.map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => changeTab(key)}
                  className={tab === key ? 'selected' : ''}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
              <button onClick={handleReset}>
                <RotateCcw size={17} /> Reiniciar catálogo
              </button>
            </aside>

            <div className="admin-content">
              {message && <Alert type="info">{message}</Alert>}

              {tab === 'productos' && (
                <>
                  <div className="admin-content-header">
                    <h3>{editingId ? 'Formulario de producto' : 'Gestión de productos (CRUD)'}</h3>
                    {!editingId && (
                      <div className="admin-actions">
                        <input
                          placeholder="Buscar SKU o nombre"
                          aria-label="Buscar productos en administración"
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                        />
                        <button className="btn-orange" onClick={() => startEditing()}>
                          <Plus size={16} /> Nuevo producto
                        </button>
                      </div>
                    )}
                  </div>

                  {editingId ? (
                    <ProductForm
                      product={form}
                      errors={errors}
                      isNew={isNew}
                      onFieldChange={updateField}
                      onSubmit={handleSubmit}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <ProductTable
                      products={filteredProducts}
                      canDelete={user.role === 'admin'}
                      onEdit={startEditing}
                      onDelete={handleDelete}
                    />
                  )}
                </>
              )}

              {tab === 'pedidos' && (
                <>
                  <h3>Pedidos de demostración</h3>
                  <OrderList
                    orders={orders}
                    emptyMessage="Aún no hay pedidos. Finaliza un checkout de prueba."
                  />
                </>
              )}

              {tab === 'usuarios' && (
                <>
                  <h3>Usuarios registrados (demo)</h3>
                  <p className="muted">Datos locales de ejemplo; no almacena contraseñas.</p>
                  {allUsers.map(item => (
                    <div className="order-line" key={item.email}>
                      <b>{item.name}</b>
                      <span>{item.email}</span>
                      <span>{item.role}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
