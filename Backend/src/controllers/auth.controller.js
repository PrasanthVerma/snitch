import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import bcrypt from "bcryptjs";

async function sendTokenResponse(user, res) {
    const token = await jwt.sign({
        id: user._id,
    }, config.jwtSecret, {
        expiresIn: "7d"
    })

    res.cookie("token", token)

    res.status(200).json({
        message: "Token generated successfully",
        success: true,
        user: {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            contact: user.contact,
            role: user.role,
            isSeller: user.isSeller
        }
    })
}


const registerUser = async (req, res) => {
    const { fullname, email, contact, password, role, isSeller = false } = req.body

    try {

        const isUserExist = await userModel.findOne({ $or: [{ email }, { contact }] })

        if (isUserExist) {
            return res.status(400).json({
                message: "User already exists with this email or contact number",
                success: false
            })
        }

        const user = await userModel.create({
            fullname,
            email,
            contact,
            password,
            role,
            isSeller: role === "seller" || Boolean(isSeller)
        })
        await sendTokenResponse(user, res)

    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Error in registering user",
            success: false,
            error
        })
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "User not found with this email",
                success: false
            })
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Invalid password",
                success: false
            })
        }

        await sendTokenResponse(user, res, "User Logged in successfully")
    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Error in logging in user",
            success: false,
            error
        })
    }
}

const googleAuth = async (req, res) => {
    try {
        const email = req.user.emails && req.user.emails.length > 0 ? req.user.emails[0].value : req.user.email;
        let user = await userModel.findOne({ email })

        if (!user) {
            user = await userModel.create({
                fullname: req.user.displayName || "Google User",
                email: email,
                contact: "0000000000",
                password: Math.random().toString(36).slice(-8),
                role: 'buyer'
            })
        }

        const token = await jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: "7d" })
        res.cookie("token", token)

        res.send(`
            <script>
                window.opener.postMessage({ type: "GOOGLE_AUTH_SUCCESS", user: ${JSON.stringify({
                    id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                               contact: user.contact,
                    role: user.role,
                    isSeller: user.isSeller
                })} }, "http://localhost:5173");
                window.close();
            </script>
        `);
    }
    catch (error) {
        console.log(error)
        res.send(`<script>window.opener.postMessage({ type: "GOOGLE_AUTH_ERROR", error: "Authentication failed" }, "http://localhost:5173"); window.close();</script>`)
    }
}

export default {
    registerUser,
    loginUser,
    googleAuth
}