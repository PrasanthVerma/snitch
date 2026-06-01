import { Router } from 'express';
import { authenticateSeller } from "../middlewares/auth.middleware.js"
import multer from "multer";
import productController from "../controllers/product.controller.js"

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB    
})


const router = Router()

router.post("/add-product", authenticateSeller, upload.array("images", 7),productController.addProduct)

export default router