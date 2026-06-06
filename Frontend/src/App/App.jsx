import React from 'react'
import "./App.css"
import { RouterProvider } from "react-router"
import { router } from "./app.routes.jsx"
import { useAuth } from '../Features/Auth/hooks/useAuth.js'
import {useEffect} from "react"
import { useSelector } from 'react-redux'

const App = () => {

    const { handleGetMe } = useAuth()

    const user = useSelector((state) => state.auth.user)
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
