import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { productService } from '../services/product.service';
import { useCartStore } from '../store/cart.store';

export const ProductManagement = () => {
  // --- STORE Y ROUTING ---
  // user: Información del usuario en sesión (contiene el rol)
  // logout: Función para destruir la sesión local en caso de error de token
  const { user, logout } = useAuthStore();
  // fetchProducts: Actualiza la lista global en Zustand para sincronizar con la tienda principal
  const { fetchProducts } = useCartStore(); 
  const navigate = useNavigate();

  // --- ESTADO LOCAL DEL COMPONENTE ---
  // products: Colección de postres registrados en la base de datos
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // feedback: Mensajes flotantes de confirmación o error de operaciones (éxito al crear/editar/eliminar)
  const [feedback, setFeedback] = useState(null);

  // --- ESTADO DEL FORMULARIO Y MODAL ---
  // isModalOpen: Controla la visibilidad del modal de creación/edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  // editingId: Si contiene un ID numérico, estamos en modo Edición. Si es null, en modo Creación.
  const [editingId, setEditingId] = useState(null);
  // formData: Datos temporales del formulario reactivo para la entidad del postre
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    image_thumbnail: '',
    image_mobile: '',
    image_tablet: '',
    image_desktop: '',
  });

  // --- OBTENER PRODUCTOS DEL SERVIDOR ---
  // Utiliza useCallback para evitar que la función se re-cree en cada renderizado y active el useEffect infinitamente
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- EFECTO DE CONTROL DE ACCESO Y CARGA INICIAL ---
  // Carga los productos únicamente si el usuario autenticado tiene el rol de administrador
  useEffect(() => {
    if (user?.role === 'admin') {
      loadProducts();
    }
  }, [user, loadProducts]);

  // --- CONTROLADORES DE APERTURA DE MODAL ---
  // handleOpenAdd: Abre el modal vacío (o con valores por defecto tipo Waffle) para crear un nuevo postre
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'Waffle',
      price: '',
      image_thumbnail: '/assets/images/image-waffle-thumbnail.jpg',
      image_mobile: '/assets/images/image-waffle-mobile.jpg',
      image_tablet: '/assets/images/image-waffle-tablet.jpg',
      image_desktop: '/assets/images/image-waffle-desktop.jpg',
    });
    setIsModalOpen(true);
  };

  // handleOpenEdit: Carga la fila seleccionada en el estado local para editarla
  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    setFormData({
      name: p.name || '',
      category: p.category || '',
      price: p.price || '',
      image_thumbnail: p.image_thumbnail || '',
      image_mobile: p.image_mobile || '',
      image_tablet: p.image_tablet || '',
      image_desktop: p.image_desktop || '',
    });
    setIsModalOpen(true);
  };

  // handleInputChange: Sincroniza las entradas de los inputs del formulario con el estado formData
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- ENVÍO DEL FORMULARIO (CREAR O ACTUALIZAR) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    // Validación de negocio del lado del cliente: El precio debe ser un número estrictamente positivo
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFeedback({ type: 'error', message: 'El precio debe ser un número positivo' });
      return;
    }

    const payload = {
      ...formData,
      price: priceNum,
    };

    try {
      if (editingId) {
        // MODO EDICIÓN: Llama a la API de actualización y muta la lista local reactivamente usando .map()
        const updated = await productService.updateProduct(editingId, payload);
        setProducts(prev => prev.map(p => p.id === editingId ? updated : p));
        setFeedback({ type: 'success', message: 'Producto actualizado exitosamente' });
      } else {
        // MODO CREACIÓN: Llama a la API de creación e inserta el nuevo elemento al principio de la tabla
        const created = await productService.createProduct(payload);
        setProducts(prev => [created, ...prev]);
        setFeedback({ type: 'success', message: 'Producto creado exitosamente' });
      }
      setIsModalOpen(false);
      // Sincroniza la lista global en Zustand para que los cambios se vean inmediatamente en la tienda
      fetchProducts(); 
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // --- ELIMINAR UN POSTRE ---
  const handleDelete = async (id, name) => {
    // Confirmación nativa preventiva
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el producto "${name}"?`)) {
      return;
    }
    setFeedback(null);
    try {
      await productService.deleteProduct(id);
      // Remueve el elemento de la tabla local reactivamente
      setProducts(prev => prev.filter(p => p.id !== id));
      setFeedback({ type: 'success', message: 'Producto eliminado correctamente' });
      // Sincroniza los cambios con la vista pública
      fetchProducts(); 
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // --- GUARDA DE ACCESO (FRONTEND) ---
  // Si no hay sesión o el usuario no es admin, bloquea la renderización e invita a regresar
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">Solo administradores pueden acceder a esta sección.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
          >
            Volver a Tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Administración de Productos</h1>
            <p className="text-sm text-gray-500">Panel de catálogo</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.name} <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-semibold">admin</span>
            </span>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
            >
              ← Tienda
            </button>
          </div>
        </div>
      </header>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`max-w-7xl mx-auto px-4 mt-4 ${feedback.type === 'success' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} border rounded-lg p-3 text-sm font-medium`}>
          {feedback.message}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Lista de Postres ({products.length})</h2>
          <button
            onClick={handleOpenAdd}
            className="bg-Red hover:bg-Red/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span className="text-lg">+</span> Agregar Producto
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 text-lg">Cargando productos...</div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
            Error: {error}
            <button onClick={loadProducts} className="ml-4 underline font-semibold">Reintentar</button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-lg">No hay productos registrados en el catálogo.</div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-rose-100 text-gray-700 text-sm uppercase tracking-wider">
                      <th className="px-6 py-3 font-semibold w-16">ID</th>
                      <th className="px-6 py-3 font-semibold w-24">Imagen</th>
                      <th className="px-6 py-3 font-semibold">Nombre</th>
                      <th className="px-6 py-3 font-semibold">Categoría</th>
                      <th className="px-6 py-3 font-semibold w-28">Precio</th>
                      <th className="px-6 py-3 font-semibold w-40 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-rose-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-gray-500">#{product.id}</td>
                        <td className="px-6 py-4">
                          <img
                            src={product.image_thumbnail || '/assets/images/image-waffle-thumbnail.jpg'}
                            alt={product.name}
                            className="size-12 rounded-lg object-cover border border-rose-200"
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">
                          ${(product.price || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold underline cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="text-red-500 hover:text-red-700 text-sm font-semibold underline cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden space-y-4">
              {products.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-rose-100 flex gap-4 items-center">
                  <img
                    src={product.image_thumbnail || '/assets/images/image-waffle-thumbnail.jpg'}
                    alt={product.name}
                    className="size-16 rounded-lg object-cover border border-rose-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-800 truncate text-sm pr-2">{product.name}</h3>
                      <span className="font-mono text-xs text-gray-400 shrink-0">#{product.id}</span>
                    </div>
                    <p className="text-xs text-gray-500">{product.category}</p>
                    <p className="font-bold text-red-500 text-sm">${(product.price || 0).toFixed(2)}</p>
                    <div className="flex gap-4 pt-1 border-t border-gray-50 mt-1">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold underline cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold underline cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Agregar / Editar */}
      {isModalOpen && (
        <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <header className="px-6 py-4 bg-rose-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-lg">
                {editingId ? 'Editar Postre' : 'Agregar Nuevo Postre'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </header>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre del Postre *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Waffle with Berries"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Categoría *</label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                  >
                    <option value="Waffle">Waffle</option>
                    <option value="Crème Brûlée">Crème Brûlée</option>
                    <option value="Macaron">Macaron</option>
                    <option value="Tiramisu">Tiramisu</option>
                    <option value="Baklava">Baklava</option>
                    <option value="Pie">Pie</option>
                    <option value="Cake">Cake</option>
                    <option value="Panna Cotta">Panna Cotta</option>
                    <option value="Brownie">Brownie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Precio ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Ej: 6.50"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <span className="block text-xs font-bold text-gray-500 uppercase mb-2">Imágenes (Rutas / URLs)</span>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] text-gray-600">Miniatura (Thumbnail)</label>
                    <input
                      type="text"
                      name="image_thumbnail"
                      value={formData.image_thumbnail}
                      onChange={handleInputChange}
                      placeholder="/assets/images/image-name-thumbnail.jpg"
                      className="w-full border border-gray-300 rounded-lg p-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600">Mobile</label>
                    <input
                      type="text"
                      name="image_mobile"
                      value={formData.image_mobile}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600">Tablet</label>
                    <input
                      type="text"
                      name="image_tablet"
                      value={formData.image_tablet}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600">Desktop</label>
                    <input
                      type="text"
                      name="image_desktop"
                      value={formData.image_desktop}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                </div>
              </div>

              <footer className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-Red hover:bg-Red/90 text-white rounded-full text-sm font-semibold transition-colors shadow-md"
                >
                  {editingId ? 'Guardar Cambios' : 'Crear Postre'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
