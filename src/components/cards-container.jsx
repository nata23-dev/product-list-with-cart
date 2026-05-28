import { ProductCard } from './product-card'
import { useCartStore } from '../store/cart.store'

export const CardsContainer = () => {

  const {products} = useCartStore()

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 w-full justify-center'>
      
      {
        products.map(item => <ProductCard key={item.name} {...item} />)
      }
    </div>
  )
}
