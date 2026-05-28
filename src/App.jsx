import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CardsContainer } from './components/cards-container';
import { Cart } from './components/cart';
import { CartConfirmation } from './components/cart-confirmation';
import { useCartStore } from './store/cart.store';
import { Header } from './components/header';
import { LoginModal } from './components/login-modal';
import { RegisterModal } from './components/register-modal';
import { OrdersHistory } from './components/orders-history';
import { PaymentManagement } from './components/PaymentManagement';
import { ProductManagement } from './components/ProductManagement';

function HomePage() {
  const { fetchProducts, loading, error } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando productos...</p>;
  if (error)   return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  return (
    <main className='flex justify-center'>
      <section className='my-6 w-full max-w-[1200px] px-4'>
        <Header />

        <div className='flex flex-col lg:flex-row gap-8 items-start'>
          <div className='flex-1 w-full'>
            <CardsContainer />
          </div>
          <Cart />
        </div>
      </section>

      <CartConfirmation />
      <LoginModal />
      <RegisterModal />
      <OrdersHistory />
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin/pagos" element={<PaymentManagement />} />
      <Route path="/admin/productos" element={<ProductManagement />} />
    </Routes>
  );
}

export default App;
