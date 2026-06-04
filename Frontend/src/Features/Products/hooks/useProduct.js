import { addProduct, getAllProductsOfSeller, getAllProducts, getProductById, updateProduct as updateProductApi, deleteProduct as deleteProductApi } from "../services/products.api.js"
import { useDispatch } from "react-redux"
import { setSellerProducts, setAllProducts } from "../store/product.slice.js"

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

    const fetchAllProducts = async () => {
        try {
            const response = await getAllProducts()
            dispatch(setAllProducts(response.products))
        } catch (err) {
            console.log(err)
            throw err
        }
    }

    const fetchProductById = async (productId) => {
        try {
            const response = await getProductById(productId)
            return response.product
        } catch (err) {
            console.log(err)
            throw err
        }
    }

    const updateProduct = async (productId, formData) => {

        try {
            const response = await updateProductApi(productId, formData)
            return response.product
        } catch (err) {
            console.log(err)
            throw err
        }
    }

    const deleteProduct = async (productId) => {
        try {
            await deleteProductApi(productId)
            await fetchAllProductsOfSeller()
        } catch (err) {
            console.log(err)
            throw err
        }
    }

    return {
        handleAddProduct,
        fetchAllProductsOfSeller,
        fetchAllProducts,
        fetchProductById,
        updateProduct,
        deleteProduct
    }
}