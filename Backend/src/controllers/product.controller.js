import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";


export const addProduct = async (req, res) => {

    try {
        const { name, description, priceAmount, priceCurrency } = req.body
        const seller = req.user

        const images = await Promise.all(req.files.map(async (file) => {
            return await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname
            })
        }))
        const product = await productModel.create({
            name,
            description,
            price: {
                amount: priceAmount,
                currency: priceCurrency || "INR"
            },
            images,
            seller: seller._id
        })

        return res.status(201).json({
            message: "Product added successfully",
            success: true,
            product
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Error in adding product",
            success: false
        })
    }

}

export const getAllProductsOfSeller = async (req, res) => {

    try {
        const seller = req.user
        const products = await productModel.find({ seller: seller._id })
        return res.status(200).json({
            message: "Products fetched successfully",
            success: true,
            products
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Error in fetching products",
            success: false
        })
    }
}

export const getAllProducts = async (req, res) => {
    try {
        const products = await productModel.find()
        return res.status(200).json({
            message: "Products fetched successfully",
            success: true,
            products
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Error in fetching products",
            success: false
        })
    }
}

export const getProductById =async (req,res)=>{
    try{
        const productId = req.params.id
        const product = await productModel.findById(productId)
        return res.status(200).json({
            message: "Product fetched successfully",
            success: true,
            product
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Error in fetching product",
            success: false
        })
    }
}

export default {
    addProduct,
    getAllProductsOfSeller,
    getAllProducts,
    getProductById
}
