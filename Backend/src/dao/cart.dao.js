import mongoose from "mongoose"
import cartModel from "../models/cart.model.js"

export const getAggregatedCart = async (userId) => {
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