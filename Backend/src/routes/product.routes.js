import { Router } from 'express';
import { authenticateSeller } from "../middlewares/auth.middleware.js"
import multer from "multer";
import productController from "../controllers/product.controller.js"

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB    
})


const router = Router()

/**
 * @route POST /api/products/add-product
 * @desc Add a new product (Seller only)
 * @access Private (Seller)
 */
router.post("/add-product", authenticateSeller, upload.array("images", 7),productController.addProduct)

/**
 * @route GET /api/products/seller/get-products
 * @desc Get all products of a seller
 * @access Private (Seller)
 */
router.get("/seller/get-products",authenticateSeller,productController.getAllProductsOfSeller)

/**
 * @route GET /api/products
 * @desc Get all the products
 * @access Public
 */
router.get("/",productController.getAllProducts)

/**
 * @route GET /api/products/product/:id
 * @desc Get a specific product by ID
 * @access Public
 */
router.get("/product/:id", productController.getProductById)

/**
 * @route POST /api/products/update-product/:id
 * @desc Update a product (Seller only)
 * @access Private (Seller)
 */
router.post("/update-product/:id", authenticateSeller, upload.array("images", 7), productController.updateProduct)


export default router