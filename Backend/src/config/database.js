import mongoose from "mongoose"
import config from "./config.js"

export const connectToDB = async () => {
    mongoose.connect(config.mongoURI).then(
        () => {
            console.log("Connected to DB")
        }
    )
}