import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockOfVariant } from "../dao/product.dao.js";
import mongoose from "mongoose";

const getAggregatedCart = async (userId) => {
    let cartDoc = await cartModel.findOne({ user: userId })
    if (!cartDoc) {
        cartDoc = await cartModel.create({ user: userId })
    }

    if (cartDoc.items.length === 0) {
        return cartDoc
    }

    const cart = (await cartModel.aggregate([
        {
            '$match': {
                'user': new mongoose.Types.ObjectId(userId)
            }
        }, {
            '$unwind': '$items'
        }, {
            '$lookup': {
                'from': 'products',
                'localField': 'items.product',
                'foreignField': '_id',
                'as': 'items.product'
            }
        }, {
            '$unwind': {
                'path': '$items.product'
            }
        }, {
            '$addFields': {
                'items.product.variants': {
                    '$filter': {
                        'input': { '$ifNull': ['$items.product.variants', []] },
                        'as': 'v',
                        'cond': { '$eq': ['$$v._id', '$items.variant'] }
                    }
                }
            }
        }, {
            '$unwind': {
                'path': '$items.product.variants',
                'preserveNullAndEmptyArrays': true
            }
        }, {
            // Overwrite items.price with the current price of product/variant
            '$addFields': {
                'items.price': {
                    'amount': {
                        '$ifNull': [
                            '$items.product.variants.price.amount',
                            '$items.product.price.amount',
                            0
                        ]
                    },
                    'currency': {
                        '$ifNull': [
                            '$items.product.variants.price.currency',
                            '$items.product.price.currency',
                            'INR'
                        ]
                    }
                }
            }
        }, {
            // Compute itemPrice for totalPrice calculation
            '$addFields': {
                'itemPrice': {
                    'price': {
                        '$multiply': [
                            { '$ifNull': ['$items.quantity', 0] },
                            '$items.price.amount'
                        ]
                    },
                    'currency': '$items.price.currency'
                }
            }
        }, {
            '$group': {
                '_id': '$_id',
                'totalPrice': {
                    '$sum': '$itemPrice.price'
                },
                'currency': {
                    '$first': '$itemPrice.currency'
                },
                'items': {
                    '$push': '$items'
                }
            }
        }
    ]))[0]

    return cart || cartDoc
}

const addToCart = async (req, res) => {
    let { productId, variantId } = req.params
    const { quantity } = req.body

    // Normalize variantId
    if (variantId === "null" || variantId === "undefined" || !variantId || variantId === productId) {
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

        // Check if variant exists
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

        const targetVariantId = variantId || productId

        const isProductAlreadyInCart = cart.items.some(item => {
            return item.product.toString() === productId &&
                item.variant &&
                item.variant.toString() === targetVariantId
        })

        if (isProductAlreadyInCart) {
            const itemIndex = cart.items.findIndex(item => {
                return item.product.toString() === productId &&
                    item.variant &&
                    item.variant.toString() === targetVariantId
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
            const aggregatedCart = await getAggregatedCart(req.user._id)

            return res.status(200).json({
                message: "Cart Updated Successfully",
                success: true,
                cart: aggregatedCart
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
            variant: targetVariantId,
            quantity: quantity,
            price: finalPrice
        })

        await cart.save()
        const aggregatedCart = await getAggregatedCart(req.user._id)

        return res.status(200).json({
            message: "Added to cart",
            success: true,
            cart: aggregatedCart
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
    try {
        const cart = await getAggregatedCart(req.user._id)
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

    if (variantId === "null" || variantId === "undefined" || !variantId || variantId === productId) {
        variantId = null
    }

    try {
        const cart = await cartModel.findOne({ user: req.user._id })
        if (!cart) {
            return res.status(404).json({ message: "Cart not found", success: false })
        }

        const targetVariantId = variantId || productId

        cart.items = cart.items.filter(item => {
            const matchesProduct = item.product.toString() === productId
            const matchesVariant = item.variant && item.variant.toString() === targetVariantId
            return !(matchesProduct && matchesVariant)
        })

        await cart.save()
        const aggregatedCart = await getAggregatedCart(req.user._id)

        return res.status(200).json({
            message: "Item removed from cart",
            success: true,
            cart: aggregatedCart
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error removing from cart", success: false })
    }
}

const updateCartQuantity = async (req, res) => {
    let { productId, variantId } = req.params
    const { quantity } = req.body

    if (variantId === "null" || variantId === "undefined" || !variantId || variantId === productId) {
        variantId = null
    }

    try {
        const cart = await cartModel.findOne({ user: req.user._id })
        if (!cart) {
            return res.status(404).json({ message: "Cart not found", success: false })
        }

        const targetVariantId = variantId || productId

        const itemIndex = cart.items.findIndex(item => {
            const matchesProduct = item.product.toString() === productId
            const matchesVariant = item.variant && item.variant.toString() === targetVariantId
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
        const aggregatedCart = await getAggregatedCart(req.user._id)

        return res.status(200).json({
            message: "Cart updated successfully",
            success: true,
            cart: aggregatedCart
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