import {Router} from "express";
import { validateRegisterUser } from "../validators/auth.validator.js";
import authController from "../controllers/auth.controller.js";
import passport from "passport";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router()


/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post("/register",validateRegisterUser,authController.registerUser)

/**
 * @route POST /api/auth/login
 * @desc Login a user and return a JWT token
 * @access Public
 */
router.post("/login",authController.loginUser)

/**
 * @route GET /api/auth/getme
 * @desc Get the current authenticated user
 * @access Private
 */
router.get("/getme", authenticateUser, authController.getMe)

/**
 * @route POST /api/auth/logout
 * @desc Logout a user
 * @access Private
 */
router.post("/logout", authenticateUser, authController.logoutUser)


router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleAuth
);




export default router