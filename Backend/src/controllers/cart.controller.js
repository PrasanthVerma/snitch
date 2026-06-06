import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockOfVariant } from "../dao/product.dao.js";

const addToCart = async (req, res) => {
    let { productId, variantId } = req.params
    const { quantity } = req.body
    
    // Normalize variantId
    if (variantId === "null" || variantId === "undefined" || !variantId) {
        variantId = null
    }

    try {
        const product = await productModel.findById(productId)

        if (!product) {
            return res.status(400).json({
                message: "Product Not Found",
                success: false
            })
        }

        // Check if variant exists (if variantId is provided)
        let variant = null
        if (variantId) {
            variant = product.variants.id(variantId)
            if (!variant) {
                return res.status(400).json({
                    message: "Product Variant Not Found",
                    success: false
                })
            }
        }

        const stock = await stockOfVariant(productId, variantId)

        const cart = (await cartModel.findOne({ user: req.user._id })) || (await cartModel.create({ user: req.user._id }))

        const isProductAlreadyInCart = cart.items.some(item => {
            const matchesProduct = item.product.toString() === productId
            const matchesVariant = (!item.variant && !variantId) || 
                                   (item.variant && variantId && item.variant.toString() === variantId)
            return matchesProduct && matchesVariant
        })

        if (isProductAlreadyInCart) {
            const itemIndex = cart.items.findIndex(item => {
                const matchesProduct = item.product.toString() === productId
                const matchesVariant = (!item.variant && !variantId) || 
                                       (item.variant && variantId && item.variant.toString() === variantId)
                return matchesProduct && matchesVariant
            })

            const quantityInCart = cart.items[itemIndex].quantity
            if (quantityInCart + quantity > stock) {
                return res.status(400).json({
                    message: `Cannot add more. Only ${stock} items in stock.`,
                    success: false
                })
            }

            cart.items[itemIndex].quantity += quantity
            await cart.save()
            await cart.populate("items.product")

            return res.status(200).json({
                message: "Cart Updated Successfully",
                success: true,
                cart
            })
        }

        if (quantity > stock) {
            return res.status(400).json({
                message: `Only ${stock} items in stock.`,
                success: false
            })
        }

        // Determine price
        const finalPrice = variant && variant.price ? variant.price : product.price

        cart.items.push({
            product: product._id,
            variant: variantId || null,
            quantity: quantity,
            price: finalPrice
        })

        await cart.save()
        await cart.populate("items.product")

        return res.status(200).json({
            message: "Added to cart",
            success: true,
            cart
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Error in adding to cart",
            success: false
        })
    }
}

const getCart = async (req, res) => {
    const user = req.user

    try {
        let cart = await cartModel.findOne({ user: user._id }).populate("items.product")
        if (!cart) {
            cart = await cartModel.create({ user: user._id })
        }
        return res.status(200).json({
            message: "Cart Fetched Successfully",
            success: true,
            cart
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Error fetching cart",
            success: false
        })
    }
}

const removeFromCart = async (req, res) => {
    let { productId, variantId } = req.params

    if (variantId === "null" || variantId === "undefined" || !variantId) {
        variantId = null
    }

    try {
        const cart = await cartModel.findOne({ user: req.user._id })
        if (!cart) {
            return res.status(404).json({ message: "Cart not found", success: false })
        }

        cart.items = cart.items.filter(item => {
            const matchesProduct = item.product.toString() === productId
            const matchesVariant = (!item.variant && !variantId) || 
                                   (item.variant && variantId && item.variant.toString() === variantId)
            return !(matchesProduct && matchesVariant)
        })

        await cart.save()
        await cart.populate("items.product")

        return res.status(200).json({
            message: "Item removed from cart",
            success: true,
            cart
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error removing from cart", success: false })
    }
}

const updateCartQuantity = async (req, res) => {
    let { productId, variantId } = req.params
    const { quantity } = req.body

    if (variantId === "null" || variantId === "undefined" || !variantId) {
        variantId = null
    }

    try {
        const cart = await cartModel.findOne({ user: req.user._id })
        if (!cart) {
            return res.status(404).json({ message: "Cart not found", success: false })
        }

        const itemIndex = cart.items.findIndex(item => {
            const matchesProduct = item.product.toString() === productId
            const matchesVariant = (!item.variant && !variantId) || 
                                   (item.variant && variantId && item.variant.toString() === variantId)
            return matchesProduct && matchesVariant
        })

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart", success: false })
        }

        const stock = await stockOfVariant(productId, variantId)
        if (quantity > stock) {
            return res.status(400).json({
                message: `Only ${stock} items in stock.`,
                success: false
            })
        }

        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1)
        } else {
            cart.items[itemIndex].quantity = quantity
        }

        await cart.save()
        await cart.populate("items.product")

        return res.status(200).json({
            message: "Cart updated successfully",
            success: true,
            cart
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error updating cart quantity", success: false })
    }
}

export default {
    addToCart,
    getCart,
    removeFromCart,
    updateCartQuantity
}