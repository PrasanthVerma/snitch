import { addToCart, getCart, removeFromCart, updateCartQuantity } from '../service/cart.api.js'
import { useDispatch } from 'react-redux'
import { setCart } from '../store/cart.slice'

export const useCart = () => {
    const dispatch = useDispatch()

    const handleAddToCart = async (productId, variantId) => {
        try {
            const response = await addToCart(productId, variantId)
            dispatch(setCart(response.cart))
        } catch (err) {
            console.log("Error in adding to cart", err)
        }
    }

    const handleGetCart = async () => {
        try {
            const response = await getCart()
            dispatch(setCart(response.cart))
        } catch (err) {
            console.log("Error in getting cart", err)
        }
    }

    const handleRemoveFromCart = async (productId, variantId) => {
        try {
            const response = await removeFromCart(productId, variantId)
            dispatch(setCart(response.cart))
        } catch (err) {
            console.log("Error in removing from cart", err)
        }
    }

    const handleUpdateCartQuantity = async (productId, variantId, quantity) => {
        try {
            const response = await updateCartQuantity(productId, variantId, quantity)
            dispatch(setCart(response.cart))
        } catch (err) {
            console.log("Error in updating cart quantity", err)
        }
    }

    return {
        handleAddToCart,
        handleGetCart,
        handleRemoveFromCart,
        handleUpdateCartQuantity
    }
}