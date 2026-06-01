import { addProduct, getAllProductsOfSeller } from "../services/products.api.js"
import { useDispatch } from "react-redux"
import { setSellerProducts } from "../store/product.slice.js"

export const useProduct = () => {
    const dispatch = useDispatch()

    const handleAddProduct = async (formData) => {
        try {
            const response = await addProduct(formData)
            return response.product
        } catch (err) {
            console.log(err)
            throw err
        }
    }

    const fetchAllProductsOfSeller = async () => {
        try {
            const response = await getAllProductsOfSeller()
            dispatch(setSellerProducts(response.products))
        } catch (err) {
            console.log(err)
            throw err
        }
    }

    return {
        handleAddProduct,
        fetchAllProductsOfSeller
    }
}