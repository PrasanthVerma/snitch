import express from "express"
import morgan from "morgan"
import authRoutes from "./routes/auth.routes.js"
import cors from "cors"
import passport from "passport"
import {Strategy as GoogleStrategy}  from "passport-google-oauth20"

const app = express()

app.use(passport.initialize())
app.use(express.json())
app.use(morgan("dev"))
app.use(cors({
    origin:"http://localhost:5173",
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
}))
passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5173/api/auth/google/callback"
},
async(accessToken,refreshToken,profile,done)=>{
    done(null,profile)
}
))

app.use("/api/auth",authRoutes)


export default app 