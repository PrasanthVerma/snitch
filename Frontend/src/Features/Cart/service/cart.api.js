import axios from "axios"

const cartApiInstance = axios.create({
    baseURL: "/api/cart",
    withCredentials: true
})

export const addToCart = async (productId, variantId)=>{
    try{
        const response = await cartApiInstance.post(`/add/${productId}/${variantId || null}`, {
            quantity: 1
        })
        return response.data
    }catch(err){
        console.log("Error adding to cart", err)
        throw err
    }
}

export const getCart = async()=>{
    try{
        const response = await cartApiInstance.get(`/get`)
        return response.data
    }catch(err){
        console.log("Error fetching cart", err)
        throw err
    }
}

export const removeFromCart = async (productId, variantId) => {
    try {
        const response = await cartApiInstance.delete(`/remove/${productId}/${variantId || null}`)
        return response.data
    } catch (err) {
        console.log("Error removing from cart", err)
        throw err
    }
}

export const updateCartQuantity = async (productId, variantId, quantity) => {
    try {
        const response = await cartApiInstance.put(`/update/${productId}/${variantId || null}`, {
            quantity
        })
        return response.data
    } catch (err) {
        console.log("Error updating cart quantity", err)
        throw err
    }
}