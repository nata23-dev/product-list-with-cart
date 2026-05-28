// Ruta raíz para las llamadas HTTP de administración
const API_URL = '/api/admin';

/**
 * Helper para inyectar las cabeceras de autorización requeridas por el backend.
 * Recupera el JWT de localStorage y lo formatea como cabecera Bearer.
 */
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export const adminService = {
  /**
   * Obtiene todos los pedidos registrados en el sistema (requiere rol admin)
   */
  async getOrders() {
    const res = await fetch(`${API_URL}/orders`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener pedidos');
    return data;
  },

  /**
   * Actualiza el estado de pago de una orden (pending, paid, cancelled, etc.)
   */
  async updatePaymentStatus(orderId, paymentStatus) {
    const res = await fetch(`${API_URL}/orders/${orderId}/payment-status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ payment_status: paymentStatus }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.errors?.[0]?.msg || 'Error al actualizar');
    return data;
  },

  /**
   * Actualiza el estado de entrega o logística de una orden (preparing, delivered, etc.)
   */
  async updateOrderStatus(orderId, orderStatus) {
    const res = await fetch(`${API_URL}/orders/${orderId}/order-status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ order_status: orderStatus }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.errors?.[0]?.msg || 'Error al actualizar estado del pedido');
    return data;
  },
};
