import {createBrowserRouter} from "react-router"
import App from "./App.jsx"
import Login from "../Features/Auth/Pages/Login"
import Register from "../Features/Auth/Pages/Register"
import CreateProducts from "../Features/Products/pages/CreateProducts.jsx"

export const router = createBrowserRouter([
    {
        path:"/",
        element:<h1>Hello World</h1>,
    },
    {
        path:"/login",
        element:<Login/>,
    },
    {
        path:"/register",
        element:<Register/>,
    },
    {
        path:"/seller/add-product",
        element:<CreateProducts />
    }
])

export default router;
