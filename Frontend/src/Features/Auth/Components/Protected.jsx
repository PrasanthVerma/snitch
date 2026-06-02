import React from 'react'
import { useSelector } from "react-redux"
import { Navigate } from 'react-router'

const Protected = ({ children, role = "buyer" }) => {

    const user = useSelector((state) => state.auth.user)
    const loading = useSelector((state) => state.auth.loading)

    if (loading) {
        return <h1 className='text-2xl font-bold text-center mt-10'>Loading...</h1>
    }


    if (!user) {
        return <h1 className='text-2xl font-bold text-center mt-10'>Please login to access this page</h1>
    }

    if (user.role !== role) {
        return <Navigate to="/" />

    }


    return children
}

export default Protected
