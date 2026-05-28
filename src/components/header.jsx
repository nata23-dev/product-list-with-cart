import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useCartStore } from '../store/cart.store';

export const Header = () => {
  const { user, openLoginModal, openRegisterModal, logout } = useAuthStore();
  const { toggleOrders } = useCartStore();

  return (
    <header className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-[30px] border-b pb-4">
      <Link to="/" className="text-[2.5rem] font-bold no-underline text-Rose-900 leading-none">Desserts</Link>
      
      <div className="flex flex-wrap gap-3 items-center justify-center">
        {user ? (
          <>
            <span className="font-semibold text-Rose-900 text-sm">Hola, {user.name}</span>
            {user.role === 'admin' ? (
              <div className="flex flex-wrap gap-2 justify-center">
                <Link
                  to="/admin/pagos"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-full font-semibold text-sm transition-colors"
                >
                  Admin Pedidos
                </Link>
                <Link
                  to="/admin/productos"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full font-semibold text-sm transition-colors"
                >
                  Admin Productos
                </Link>
              </div>
            ) : (
              <button 
                onClick={toggleOrders}
                className="border border-Rose-500 text-Rose-950 hover:bg-Rose-100 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              >
                Mis Pedidos 🍕
              </button>
            )}
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            <button
              onClick={openLoginModal}
              className="border border-red-500 text-red-500 hover:bg-red-50 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={openRegisterModal}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Registrarse
            </button>
          </>
        )}
      </div>
    </header>
  );
};
