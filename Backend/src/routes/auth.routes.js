import {Router} from "express";
import { validateRegisterUser } from "../validators/auth.validator.js";
import authController from "../controllers/auth.controller.js";
import passport from "passport";

const router = Router()

router.post("/register",validateRegisterUser,authController.registerUser)
router.post("/login",authController.loginUser)
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleAuth
);


export default router