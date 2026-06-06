import productModel from "../models/product.model.js" 
import mongoose from "mongoose"

export const stockOfVariant = async (productId, variantId)=>{
    const product = await productModel.findById(productId)
    if (!product) return 0
    if (!variantId || variantId === "null" || variantId === "undefined") {
        return product.stock || 0
    }

    const variant = product.variants.id(variantId)
    return variant ? (variant.stock || 0) : 0
}