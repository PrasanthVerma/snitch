import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const authenticateSeller = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if (decoded.role !== "seller") {
            return res.status(403).json({ message: "Forbidden" })
        }
        req.user = user;
        next()

    }
    catch (err) {
        throw new Error("Invalid token")
    }
}