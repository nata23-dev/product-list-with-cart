import { useCartStore } from '../store/cart.store';

export const ProductCard = ({ id, image, name, category, price }) => {
  const { addItemToCart, updateItemInCart, deleteItemfromCart, cart } =
    useCartStore();

  let quantity = 0;
  const itemsInCart = cart.filter(item => item.name === name);

  if (itemsInCart.length > 0) {
    quantity = itemsInCart[0].quantity;
  }

  const addOne = () => {
    const newQuantity = quantity + 1;

    if (newQuantity > 1) {
      updateItemInCart({
        id,
        image,
        name,
        price,
        quantity: newQuantity,
      });
    } else {
      addItemToCart({
        id,
        image,
        name,
        price,
        quantity: newQuantity,
      });
    }
  };

  const subtractOne = () => {
    const newQuantity = quantity - 1;

    if (newQuantity === 0) {
      deleteItemfromCart(name);
    } else {
      updateItemInCart({
        id,
        image,
        name,
        price,
        quantity: newQuantity,
      });
    }
  };

  return (
    <div className='flex flex-col w-full'>
      <div className='relative mb-7 w-full'>
        <picture>
          <source media='(min-width: 1024px)' srcSet={image.desktop} />
          <source media='(min-width: 640px)' srcSet={image.tablet} />
          <img
            className={`w-full rounded-lg object-cover aspect-square border-2 transition-all duration-200 ${
              quantity > 0 ? 'border-Red' : 'border-transparent'
            }`}
            src={image.mobile}
            alt={name}
          />
        </picture>

        {quantity === 0 ? (
          <button
            onClick={addOne}
            className='bg-Rose-50 border border-Rose-300 hover:border-Red w-40 rounded-full flex justify-center items-center gap-2 p-2.5 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-pointer hover:text-Red transition-all duration-200 shadow-md font-semibold text-sm text-Rose-900'
          >
            <img
              src='/assets/images/icon-add-to-cart.svg'
              alt='icon-add-to-cart'
            />
            <span>Add to Cart</span>
          </button>
        ) : (
          <div className='bg-Red w-40 rounded-full flex justify-between items-center gap-2 p-2.5 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 shadow-md'>
            <button
              onClick={subtractOne}
              className='group border border-Rose-50 hover:bg-white size-[18px] rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer p-0 w-[18px] h-[18px]'
              aria-label="Decrement quantity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2" className="stroke-white group-hover:stroke-Red transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h8" />
              </svg>
            </button>
            <p className='text-Rose-50 font-bold text-sm'>{quantity}</p>
            <button
              onClick={addOne}
              className='group border border-Rose-50 hover:bg-white size-[18px] rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer p-0 w-[18px] h-[18px]'
              aria-label="Increment quantity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10" className="stroke-white group-hover:stroke-Red transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h8M5 1v8" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className='text-Rose-500 text-xs'>{category}</p>
        <h2 className='font-semibold text-base text-Rose-900 leading-tight'>{name}</h2>
        <p className='text-Red font-bold text-base'>${price.toFixed(2)}</p>
      </div>
    </div>
  );
};
