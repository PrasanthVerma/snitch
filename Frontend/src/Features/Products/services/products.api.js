import axios from "axios"

const productApiInstance = axios.create({
    baseURL: "/api/products",
    withCredentials: true
})

export async function addProduct(formData) {
    const response = await productApiInstance.post("/add-product", formData)
    return response.data
}

export async function getAllProductsOfSeller() {
    const response = await productApiInstance.get("/seller/get-products")
    return response.data
}

export async function getAllProducts() {
    const response = await productApiInstance.get("/")
    return response.data
}

export async function getProductById(productId) {
    const response = await productApiInstance.get(`/product/${productId}`)
    return response.data
}

export async function updateProduct(productId, formData) {
    const response = await productApiInstance.post(`/update-product/${productId}`, formData)
    return response.data
}