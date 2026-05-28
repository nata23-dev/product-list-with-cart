import { Router } from 'express';
import { validationResult } from 'express-validator';
// authenticate: Valida la existencia y firma del JWT Bearer Token
// requireAdmin: Consulta la BD para verificar si el usuario tiene rol 'admin'
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { getAllOrders, updatePaymentStatus, updateOrderStatus } from '../controllers/admin.controller.js';
import { paymentStatusValidation } from '../validators/order.validator.js';

const router = Router();

// Middleware local para capturar y procesar errores de validación de express-validator
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// APLICA DE MANERA GLOBAL A ESTAS RUTAS:
// Toda llamada a las rutas definidas abajo debe estar autenticada y autorizada como Admin
router.use(authenticate, requireAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Gestión administrativa (solo usuarios con rol admin)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminOrder:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         user_name:
 *           type: string
 *         user_email:
 *           type: string
 *         total_price:
 *           type: number
 *         payment_status:
 *           type: string
 *           enum: [pending, paid, cancelled, rejected, expired]
 *         order_status:
 *           type: string
 *         payment_method:
 *           type: string
 *         delivery_address:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *     PaymentStatusUpdate:
 *       type: object
 *       required:
 *         - payment_status
 *       properties:
 *         payment_status:
 *           type: string
 *           enum: [pending, paid, cancelled, rejected, expired]
 */

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Obtiene todos los pedidos (solo admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos con datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminOrder'
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Acceso denegado (no admin)
 */
// Obtención de todos los pedidos (combina información de múltiples BD)
router.get('/orders', getAllOrders);

/**
 * @swagger
 * /api/admin/orders/{orderId}/payment-status:
 *   patch:
 *     summary: Actualiza el estado de pago de un pedido (solo admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentStatusUpdate'
 *     responses:
 *       200:
 *         description: Estado de pago actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminOrder'
 *       400:
 *         description: Estado inválido o pedido ya pagado
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Acceso denegado (no admin)
 *       404:
 *         description: Pedido no encontrado
 */
// Modifica el estado del pago. Valida que el estado sea correcto usando paymentStatusValidation.
router.patch(
  '/orders/:orderId/payment-status',
  paymentStatusValidation,
  handleValidationErrors,
  updatePaymentStatus,
);

// Modifica el estado logístico del pedido (Ej: preparando, entregado)
router.patch(
  '/orders/:orderId/order-status',
  updateOrderStatus,
);

export default router;
