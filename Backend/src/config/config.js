import dotenv from "dotenv"

dotenv.config()


if(!process.env.MONGO_URI){
    throw new Error("MONGO_URI is not defined in environment variables")
}

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined in environment variables")
}

if(!process.env.IMAGEKIT_PRIVATE_KEY){
    throw new Error("IMAGEKIT_PRIVATE_KEY is not defined in environment variables")
}

const config ={
    mongoURI:process.env.MONGO_URI,
    jwtSecret:process.env.JWT_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    imagekitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY
}

export default config