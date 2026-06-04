import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";



//Add a new product
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

//Get all products of a seller
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

//Get all the products
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

// Get a specific product's details by ID
export const getProductById = async (req, res) => {
    try {
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

// Update an existing product (seller only)
export const updateProduct = async (req, res) => {

    try {
        const productId = req.params.id
        const { name, description, priceAmount, priceCurrency, images } = req.body
        const seller = req.user
        const product = await productModel.findOne({ _id: productId, seller: seller._id })
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false
            })
        }
        let updatedImages = product.images;
        if (images !== undefined) {
            try {
                const parsedImages = typeof images === 'string' ? JSON.parse(images) : images;
                if (Array.isArray(parsedImages)) {
                    updatedImages = parsedImages.map(img => typeof img === 'string' ? { url: img } : { url: img.url });
                }
            } catch (err) {
                console.log("Error parsing images in body:", err);
            }
        }

        // If new images are uploaded, upload them and update the product's images
        if (req.files && req.files.length > 0) {
            const uploadedImages = await Promise.all(req.files.map(async (file) => {
                const uploadResult = await uploadFile({
                    buffer: file.buffer,
                    fileName: file.originalname
                });
                return { url: uploadResult.url };
            }))
            updatedImages = [...updatedImages, ...uploadedImages];
        }
        product.images = updatedImages;

        product.name = name || product.name
        product.description = description || product.description
        product.price.amount = priceAmount || product.price.amount
        product.price.currency = priceCurrency || product.price.currency

        await product.save()

        return res.status(200).json({
            message: "Product updated successfully",
            success: true,
            product
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Error in updating product",
            success: false
        })
    }

}
export default {
    addProduct,
    getAllProductsOfSeller,
    getAllProducts,
    getProductById,
    updateProduct
}
