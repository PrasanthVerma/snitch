import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockOfVariant } from "../dao/product.dao.js";
import mongoose from "mongoose";
import { createOrder } from "../services/payment.service.js"
import paymentModel from "../models/payment.model.js"
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import { getAggregatedCart } from "../dao/cart.dao.js"
import config from "../config/config.js"

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

const createOrderController = async (req, res) => {

    const user = req.user._id

    const cart = await getAggregatedCart(user)

    if (!cart) {
        return res.status(404).json({
            message: "Cart is empty",
            success: false
        })
    }

    const order = await createOrder({ amount: cart.totalPrice, currency: cart.currency })

    const payment = await paymentModel.create({
        user: user,
        razorpay: {
            orderId: order.id,
        },
        price: {
            amount: cart.totalPrice,
            currency: cart.currency
        },
        orderItems: cart.items.map(item => ({
            title: item.product.name,
            productId: item.product._id,
            variantId: item.variant,
            quantity: item.quantity,
            images: item.product.variants?.images || item.product.images,
            description: item.product.description,
            price: item.price
        }))

    })

    return res.status(200).json({
        message: "Order created Successfully",
        success: true,
        order
    })
}

const verifyOrderController = async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body

    const payment = await paymentModel.findOne({
        "razorpay.orderId":razorpay_order_id,
        status:"pending"
    })

    if(!payment){
        return res.status(404).json({
            message: "Payment not found",
            success: false
        })
    }

    const isPaymentValid = validatePaymentVerification({
        order_id:razorpay_order_id,
        payment_id:razorpay_payment_id
    },razorpay_signature,config.razorpayKeySecret)

    if(!isPaymentValid){
        payment.status = "failed"
        await payment.save()


        return res.status(401).json({
            message:"Invalid Payment",
            success:false
        })
    }

    payment.status = "paid"
    payment.razorpay.paymentId = razorpay_payment_id
    payment.razorpay.signature = razorpay_signature

    await payment.save()


    return res.status(200).json({
        message: "Payment Verified Successfully",
        success: true
    })

    
} 

export default {
    addToCart,
    getCart,
    removeFromCart,
    updateCartQuantity,
    createOrderController,
    verifyOrderController
}