import config from "../config/config.js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id:config.razorpayKeyId,
    key_secret:config.razorpayKeySecret
});

export const createOrder = async ({amount,currency = "INR"}) =>{
    const options = {
        amount : amount *100,
        currency,
    }

    const order = await razorpay.orders.create(options)

    return order
}