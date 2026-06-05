import {createBrowserRouter} from "react-router"
import App from "./App.jsx"
import Login from "../Features/Auth/Pages/Login"
import Register from "../Features/Auth/Pages/Register"
import CreateProducts from "../Features/Products/pages/CreateProducts.jsx"
import Dashboard from "../Features/Products/pages/Dashboard.jsx"
import Protected from "../Features/Auth/Components/Protected.jsx"
import { useSelector } from "react-redux"
import Home from "../Features/Products/pages/Home.jsx"
import ProductDetails from "../Features/Products/pages/ProductDetails.jsx"
import UpdateProduct from "../Features/Products/pages/UpdateProduct.jsx"
import AddVariant from "../Features/Products/pages/AddVariant.jsx"

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
            },
            {
                path:"/seller/update-product/:id",
                element:<Protected role="seller"><UpdateProduct /></Protected>
            },
            {
                path:"/seller/:productId/add-variant",
                element:<Protected role="seller"><AddVariant /></Protected>
            }
        ]
    },
    {
        path:"/product/:id",
        element:<ProductDetails/>,
    }
])

export default router;
