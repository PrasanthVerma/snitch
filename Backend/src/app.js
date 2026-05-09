import express from "express"
import morgan from "morgan"
import authRoutes from "./routes/auth.routes.js"
import cors from "cors"

const app = express()


app.use(express.json())
app.use(morgan("dev"))
app.use(cors({
    origin:"http://localhost:5173",
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
}))

app.use("/api/auth",authRoutes)


export default app 