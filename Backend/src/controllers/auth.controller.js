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
            role: user.role
        }
    })
}


const registerUser = async (req, res) => {
    const { fullname, email, contact, password, role } = req.body

    try {

        const isUserExist = await User.findOne({ $or: [{ email }, { contact }] })

        if (isUserExist) {
            return res.status(400).json({
                message: "User already exists with this email or contact number",
                success: false
            })
        }

        const user = userModel.create({
            fullname, email, contact, password, role
        })
        await sendTokenResponse(user, res, "User registered successfully")

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

export default {
    registerUser,
    loginUser
}