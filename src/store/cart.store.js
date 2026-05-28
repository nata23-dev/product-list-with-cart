import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  isClose: true,
  isOrdersOpen: false,
  cart: [],
  products: [],
  submittinOrder: false,
  orderResult: null,
  loading: false,
  error: null,

  toggleOrders: () => set((state) => ({ isOrdersOpen: !state.isOrdersOpen })),

  // Obtiene los productos desde el backend
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Error al cargar productos');
      const data = await res.json();

      const formatted = data.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        image: {
          thumbnail: p.image_thumbnail,
          mobile: p.image_mobile,
          tablet: p.image_tablet,
          desktop: p.image_desktop,
        },
      }));

      set({ products: formatted, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  toggleClose: () => set((state) => ({ isClose: !state.isClose })),
  resetCart: () => set(() => ({ cart: [], orderResult: null })),

  confirmOrder: async (deliveryAddress, deliveryNotes, paymentMethod) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Debes iniciar sesión para realizar un pedido');

    const items = get().cart.map(item => ({
      name: item.name,
      quantity: item.quantity
    }));

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items,
        delivery_address: deliveryAddress,
        delivery_notes: deliveryNotes,
        payment_method: paymentMethod
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al procesar el pedido');
    
    return data.order;
  },

  addItemToCart: (newItem) => set((state) => ({
    cart: [...state.cart, newItem],
  })),
  updateItemInCart: (updateItem) => set((state) => ({
    cart: state.cart.map(item =>
      item.name === updateItem.name ? { ...updateItem } : item
    ),
  })),
  deleteItemfromCart: (name) => set((state) => ({
    cart: state.cart.filter(item => item.name !== name),
  })),
  totalCard: () => get().cart.reduce(
    (acc, item) => acc + item.quantity * item.price, 0
  ),
  setSubmittingOrder: (val) => set({ submittinOrder: val }),
  setOrderResult: (val) => set({ orderResult: val }),
}));
