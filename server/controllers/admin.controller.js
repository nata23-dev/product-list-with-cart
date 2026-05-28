// Carga de modelos mapeados a diferentes bases de datos (Neon Tech)
import { Order, OrderItem, User } from '../models/index.js';

// Estados válidos para control de flujo
const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'cancelled', 'rejected', 'expired'];
const VALID_ORDER_STATUSES = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

/**
 * getAllOrders:
 * Obtiene el listado completo de pedidos. Realiza una integración cruzada (cross-database query)
 * consultando la tabla de pedidos y asociando en memoria los datos del usuario cliente
 * que se encuentran en la base de datos de autenticación independiente.
 */
export const getAllOrders = async (req, res) => {
  try {
    // 1. Obtiene los pedidos ordenados de forma descendente por fecha de creación
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
    });

    // 2. Extrae los IDs de usuarios únicos implicados en los pedidos para evitar duplicidad de consultas
    const userIds = [...new Set(orders.map(o => o.user_id))];

    // 3. Consulta la base de datos de autenticación para obtener el nombre e email de los clientes
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'name', 'email'],
    });

    // 4. Mapea la información de usuarios en memoria para realizar una búsqueda rápida O(1)
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u; });

    // 5. Combina la información física de ambos modelos en un solo payload estructurado para el admin panel
    const result = orders.map(order => ({
      id: order.id,
      user_id: order.user_id,
      user_name: userMap[order.user_id]?.name || 'Usuario desconocido',
      user_email: userMap[order.user_id]?.email || '',
      total_price: order.total_price,
      payment_status: order.payment_status,
      order_status: order.order_status,
      payment_method: order.payment_method,
      delivery_address: order.delivery_address,
      delivery_notes: order.delivery_notes,
      created_at: order.createdAt,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error al obtener pedidos' });
  }
};

/**
 * updatePaymentStatus:
 * Actualiza el estado del pago de un pedido. Contiene reglas de negocio críticas:
 * - Impide cambiar un pedido que ya está pagado a otro estado pagado.
 * - Si el estado cambia a cancelado, rechazado o expirado, cancela de forma automática la entrega.
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { payment_status } = req.body;

    // Validación defensiva del estado de pago
    if (!VALID_PAYMENT_STATUSES.includes(payment_status)) {
      return res.status(400).json({
        message: `Estado inválido. Valores permitidos: ${VALID_PAYMENT_STATUSES.join(', ')}`,
      });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Regla de consistencia: Un pedido pagado no puede volver a pagarse
    if (order.payment_status === 'paid' && payment_status === 'paid') {
      return res.status(400).json({ message: 'El pedido ya está pagado' });
    }

    order.payment_status = payment_status;

    // Máquina de estados: Si el pago se cancela/rechaza/expira, la logística del pedido se cancela automáticamente
    if (['cancelled', 'rejected', 'expired'].includes(payment_status)) {
      order.order_status = 'cancelled';
    }

    await order.save();

    // Obtiene la información del usuario correspondiente para devolver el objeto completo
    const user = await User.findByPk(order.user_id, {
      attributes: ['id', 'name', 'email'],
    });

    res.json({
      id: order.id,
      user_id: order.user_id,
      user_name: user?.name || 'Usuario desconocido',
      user_email: user?.email || '',
      total_price: order.total_price,
      payment_status: order.payment_status,
      order_status: order.order_status,
      payment_method: order.payment_method,
      delivery_address: order.delivery_address,
      delivery_notes: order.delivery_notes,
      created_at: order.createdAt,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Error al actualizar estado de pago' });
  }
};

/**
 * updateOrderStatus:
 * Modifica directamente la etapa logística del pedido (preparando, en camino, entregado).
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { order_status } = req.body;

    // Validación defensiva del estado logístico
    if (!VALID_ORDER_STATUSES.includes(order_status)) {
      return res.status(400).json({
        message: `Estado inválido. Valores permitidos: ${VALID_ORDER_STATUSES.join(', ')}`,
      });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    order.order_status = order_status;
    await order.save();

    const user = await User.findByPk(order.user_id, {
      attributes: ['id', 'name', 'email'],
    });

    res.json({
      id: order.id,
      user_id: order.user_id,
      user_name: user?.name || 'Usuario desconocido',
      user_email: user?.email || '',
      total_price: order.total_price,
      payment_status: order.payment_status,
      order_status: order.order_status,
      payment_method: order.payment_method,
      delivery_address: order.delivery_address,
      delivery_notes: order.delivery_notes,
      created_at: order.createdAt,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error al actualizar estado del pedido' });
  }
};
