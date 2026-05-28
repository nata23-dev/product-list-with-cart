import React, { useState, useEffect } from 'react';
import { useCartStore } from '../store/cart.store';
import { useAuthStore } from '../store/auth.store';

export const OrdersHistory = () => {
  const { isOrdersOpen, toggleOrders } = useCartStore();
  const { token, user } = useAuthStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar historial de pedidos cuando se abra el modal
  useEffect(() => {
    if (isOrdersOpen && token) {
      fetchOrders();
    }
  }, [isOrdersOpen, token]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al obtener tus pedidos');
      
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'out_for_delivery': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente 🕒';
      case 'preparing': return 'Preparando 🍳';
      case 'out_for_delivery': return 'En camino 🛵';
      case 'delivered': return 'Entregado ✅';
      case 'cancelled': return 'Cancelado ❌';
      default: return status;
    }
  };

  if (!isOrdersOpen) return null;

  return (
    <dialog open={isOrdersOpen} className='bg-black/50 w-full fixed inset-0 z-50 h-screen grid place-content-center overflow-y-auto py-10'>
      <div className='w-[375px] md:w-[650px] py-8 px-6 bg-white rounded-xl shadow-2xl max-h-[85vh] flex flex-col'>
        
        {/* Encabezado */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-Rose-100">
          <div>
            <h2 className='text-[2rem] font-bold text-Rose-900'>Historial de Pedidos</h2>
            <p className="text-Rose-500 text-sm">Pedidos guardados en la BD de Pedidos para {user?.name}</p>
          </div>
          <button 
            onClick={toggleOrders}
            className="text-Rose-500 hover:text-Rose-900 bg-Rose-100 hover:bg-Rose-200 p-2 rounded-full transition"
            aria-label="Cerrar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cuerpo / Listado */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[55vh] scrollbar-thin">
          
          {loading && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-Red mx-auto mb-4"></div>
              <p className="text-Rose-500 text-sm">Consultando microservicio de pedidos...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded">
              <span className="font-bold">Error:</span> {error}
              <button 
                onClick={fetchOrders} 
                className="block mt-2 font-semibold underline text-red-800"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="text-center py-12 bg-Rose-50 rounded-xl border border-dashed border-Rose-200">
              <img src="/assets/images/icon-carbon-neutral.svg" alt="no-orders" className="mx-auto mb-4 h-12 w-12 opacity-60" />
              <h3 className="font-bold text-Rose-900 text-lg mb-1">Aún no has realizado pedidos</h3>
              <p className="text-Rose-500 text-sm max-w-xs mx-auto">
                Los pedidos que realices con el carrito y confirmes se guardarán y aparecerán aquí.
              </p>
            </div>
          )}

          {!loading && !error && orders.map(order => (
            <div 
              key={order.id} 
              className="bg-Rose-50 border border-Rose-200 rounded-xl p-5 hover:shadow-md transition duration-200"
            >
              {/* Encabezado del pedido */}
              <div className="flex justify-between items-start pb-3 mb-3 border-b border-Rose-200/60">
                <div>
                  <span className="font-bold text-Rose-900 text-base">Pedido #{order.id}</span>
                  <span className="block text-Rose-400 text-xs mt-0.5">
                    {new Date(order.createdAt).toLocaleString('es-ES', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${getStatusBadgeClass(order.order_status)}`}>
                  {getStatusLabel(order.order_status)}
                </span>
              </div>

              {/* Items del pedido */}
              <div className="space-y-2 mb-4">
                {order.items?.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-Red font-bold text-xs">{item.quantity}x</span>
                      <span className="text-Rose-900 font-medium text-xs">{item.product_name}</span>
                    </div>
                    <span className="text-Rose-500 text-xs">
                      ${(item.unit_price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dirección y notas */}
              <div className="bg-white p-3 rounded-lg border border-Rose-100 text-xs mb-3 space-y-1 text-Rose-700">
                <p><strong>📍 Dirección:</strong> {order.delivery_address}</p>
                {order.delivery_notes && <p><strong>📝 Notas:</strong> {order.delivery_notes}</p>}
                <p><strong>💳 Pago:</strong> <span className="capitalize">{order.payment_method === 'cash' ? 'efectivo' : order.payment_method}</span> — <span className="font-semibold text-green-700">{order.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}</span></p>
              </div>

              {/* Total del pedido */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-Rose-500 text-xs font-semibold">Total del Pedido:</span>
                <span className="text-Rose-900 text-base font-bold">${order.total_price.toFixed(2)}</span>
              </div>
            </div>
          ))}

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-Rose-100 flex justify-end">
          <button 
            onClick={toggleOrders}
            className="bg-Rose-900 hover:bg-Rose-950 text-white font-bold text-sm px-6 py-3 rounded-full transition w-full md:w-auto"
          >
            Cerrar Historial
          </button>
        </div>

      </div>
    </dialog>
  );
};
