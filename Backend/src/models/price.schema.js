import mongoose from "mongoose"

const priceSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR'],
        required: true
    }
},{
    _id:false,
    _v:false
}
)

export default priceSchema