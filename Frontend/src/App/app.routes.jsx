import {createBrowserRouter} from "react-router"
import App from "./App.jsx"
import Login from "../Features/Auth/Pages/Login"
import Register from "../Features/Auth/Pages/Register"
import CreateProducts from "../Features/Products/pages/CreateProducts.jsx"
import Dashboard from "../Features/Products/pages/Dashboard.jsx"
import Protected from "../Features/Auth/Components/Protected.jsx"
import { useSelector } from "react-redux"
import Home from "../Features/Products/pages/Home.jsx"

export const router = createBrowserRouter([
    {
        path:"/",
        element:<Home/>,
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
        path:"/seller",
        children:[
            {
                path:"/seller/add-product",
                element:<Protected role="seller"><CreateProducts/></Protected>
            },
            {
                path:"/seller/dashboard",
                element:<Protected role="seller"><Dashboard /></Protected>
            }
        ]
    }
])

export default router;
