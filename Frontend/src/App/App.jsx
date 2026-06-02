import React from 'react'
import "./App.css"
import { RouterProvider } from "react-router"
import { router } from "./app.routes.jsx"
import { useAuth } from '../Features/Auth/hooks/useAuth.js'
import {useEffect} from "react"

const App = () => {

    const { handleGetMe } = useAuth()

    useEffect(() => {
        handleGetMe()
    }, [])


    return (
        <>
            <RouterProvider router={router} />
        </>
    )
}

export default App
