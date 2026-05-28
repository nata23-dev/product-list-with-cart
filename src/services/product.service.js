// Endpoint base de la API de productos
const API_URL = '/api/products';

/**
 * Retorna las cabeceras comunes con el token JWT si está presente en localStorage.
 * Requerido para operaciones de escritura protegidas por rol de administrador.
 */
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export const productService = {
  /**
   * Obtiene todos los productos del catálogo (ruta pública)
   */
  async getProducts() {
    const res = await fetch(`${API_URL}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener productos');
    return data;
  },

  /**
   * Crea un nuevo postre en la base de datos (requiere token y rol admin)
   */
  async createProduct(productData) {
    const res = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.errors?.[0]?.msg || 'Error al crear producto');
    return data;
  },

  /**
   * Modifica un producto existente por su ID (requiere token y rol admin)
   */
  async updateProduct(id, productData) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.errors?.[0]?.msg || 'Error al actualizar producto');
    return data;
  },

  /**
   * Elimina un producto por su ID (requiere token y rol admin)
   */
  async deleteProduct(id) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al eliminar producto');
    return data;
  },
};
