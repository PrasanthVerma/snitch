import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";



//Add a new product
export const addProduct = async (req, res) => {

    try {
        const { name, description, priceAmount, priceCurrency, stock } = req.body
        const seller = req.user

        const images = await Promise.all(req.files.map(async (file) => {
            return await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname
            })
        }))

        let attributes = {}
        try{
            attributes = typeof req.body.attributes === 'string' 
                ? JSON.parse(req.body.attributes || "{}") 
                : (req.body.attributes || {})
        }catch(err){
            return res.status(400).json({
                message: "Invalid attributes format. Must be JSON.",
                success: false
            })
        }
        
        const stockParsed = stock !== undefined && stock !== "" ? Number(stock) : 0

        const product = await productModel.create({
            name,
            description,
            price: {
                amount: priceAmount,
                currency: priceCurrency || "INR"
            },
            images,
            seller: seller._id,
            stock: stockParsed,
            attributes
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

// Delete a product (seller only)
export const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id
        const seller = req.user
        const product = await productModel.findOneAndDelete({ _id: productId, seller: seller._id })

        if (!product) {
            return res.status(404).json({
                message: "Product not found or you are not authorized to delete this product",
                success: false
            })
        }

        return res.status(200).json({
            message: "Product deleted successfully",
            success: true
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Error in deleting product",
            success: false
        })
    }
}

//Add a variant to a product (Seller only)
export const addVariantToProduct = async (req, res) => {
    try {
        const productId = req.params.productId
        const seller = req.user
        const product = await productModel.findOne({ _id: productId, seller: seller._id })

        if (!product) {
            return res.status(404).json({
                message: "Product not found or you are not authorized to add a variant to this product",
                success: false
            })
        }

        // Parse attributes
        let attributes = {}
        try {
            attributes = typeof req.body.attributes === 'string' 
                ? JSON.parse(req.body.attributes || "{}") 
                : (req.body.attributes || {})
        } catch (err) {
            return res.status(400).json({
                message: "Invalid attributes format. Must be JSON.",
                success: false
            })
        }

        // Validation: At least one attribute is required
        if (!attributes || Object.keys(attributes).length === 0) {
            return res.status(400).json({
                message: "At least one attribute is required to differentiate the variant",
                success: false
            })
        }

        // Process images: if uploaded, use them; otherwise, fallback to original product images
        let variantImages = []
        if (req.files && req.files.length > 0) {
            const uploaded = await Promise.all(req.files.map(async (file) => {
                const uploadResult = await uploadFile({
                    buffer: file.buffer,
                    fileName: file.originalname
                })
                return { url: uploadResult.url }
            }))
            variantImages = uploaded
        } else {
            variantImages = product.images.map(img => ({ url: img.url }))
        }

        // Process price
        const priceAmount = req.body.priceAmount !== undefined && req.body.priceAmount !== ""
            ? Number(req.body.priceAmount)
            : product.price.amount

        const priceCurrency = req.body.priceCurrency || product.price.currency || "INR"

        // Process stock
        const stock = req.body.stock !== undefined && req.body.stock !== "" 
            ? Number(req.body.stock) 
            : 0

        // Push variant to the product
        product.variants.push({
            images: variantImages,
            stock,
            attributes,
            price: {
                amount: priceAmount,
                currency: priceCurrency
            }
        })

        await product.save()

        return res.status(200).json({
            message: "Variant added successfully",
            success: true,
            product
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Error in adding a variant to the product",
            success: false
        })
    }
}

// Update stock of a product or its variant (Seller only)
export const updateStock = async (req, res) => {
    try {
        const productId = req.params.id
        const seller = req.user
        const { stock, variantId } = req.body

        if (stock === undefined || stock === null || isNaN(Number(stock))) {
            return res.status(400).json({
                message: "Valid stock amount is required",
                success: false
            })
        }

        const product = await productModel.findOne({ _id: productId, seller: seller._id })
        if (!product) {
            return res.status(404).json({
                message: "Product not found or you are not authorized",
                success: false
            })
        }

        if (variantId) {
            // Update stock of the variant
            const variant = product.variants.id(variantId)
            if (!variant) {
                return res.status(404).json({
                    message: "Variant not found",
                    success: false
                })
            }
            variant.stock = Number(stock)
        } else {
            // Update product stock
            product.stock = Number(stock)
        }

        await product.save()

        return res.status(200).json({
            message: "Stock updated successfully",
            success: true,
            product
        })
    } catch (err) {
        console.log("Error in updating stock:", err)
        return res.status(500).json({
            message: "Error in updating stock",
            success: false
        })
    }
}

export default {
    addProduct,
    getAllProductsOfSeller,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addVariantToProduct,
    updateStock
}

