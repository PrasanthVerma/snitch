import mongoose from "mongoose"
import priceSchema from "./price.schema.js"

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    price: priceSchema,
    images: [{
        url: {
            type: String,
            required: true
        },
    }],
    stock:{
        type:Number,
        required:true,
        default:0
    },
    attributes:{
        type:Map,
        of:String
    },
    variants: [
        {
            images: [
                {
                    url: {
                        type: String,
                        required: true
                    }
                }
            ],
            stock: {
                type: Number,
                default: 0
            },
            attributes: {
                type: Map,
                of: String
            },
            price:priceSchema
        }
    ]
}, { timestamps: true })

const productModel = mongoose.model("Product", productSchema)

export default productModel