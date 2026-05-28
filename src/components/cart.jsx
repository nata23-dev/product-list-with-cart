import { CartItem } from './cart-item'
import { CartTotal } from './cart-total'
import { CartButton } from './cart-button'
import { useCartStore } from '../store/cart.store'

export const Cart = () => {
  const { toggleClose, cart } = useCartStore();

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className='bg-Rose-50 p-6 rounded-xl w-full lg:w-[380px] lg:shrink-0'>
      <h2 className='text-Red font-bold text-2xl mb-6'>Your Cart ({totalQuantity})</h2>
      {cart.length === 0 ? (
        <div className="flex flex-col items-center py-10">
          <img src="/assets/images/illustration-empty-cart.svg" alt="Empty Cart" className="mb-4" />
          <p className="text-Rose-500 text-sm font-semibold">Your added items will appear here</p>
        </div>
      ) : (
        <>
          {cart.map(item => <CartItem key={item.name} {...item} />)}
          <CartTotal />
          <div className='bg-Rose-100 rounded-lg flex justify-center gap-1 p-4 mb-6'>
            <img src="/assets/images/icon-carbon-neutral.svg" alt="" />
            <p className='text-sm'>This is a <span className='font-bold'>carbon neutral</span> delivery</p>
          </div>
          <CartButton onClick={toggleClose} text="Confirm Order" />
        </>
      )}
    </div>
  );
};
