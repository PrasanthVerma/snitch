import {Router} from "express";
import { validateRegisterUser } from "../validators/auth.validator.js";
import authController from "../controllers/auth.controller.js";

const router = Router()

router.post("/register",validateRegisterUser,authController.registerUser)
router.post("/login",authController.loginUser)


export default router