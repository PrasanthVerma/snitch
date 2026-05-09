import { register, login } from "../services/auth.api.js"

export const useAuth = () => {
    const handleRegister = async ({ fullname, email, contact, password, isSeller }) => {
        const response = await register({ fullname, email, contact, password, isSeller })
        return response
    }

    const handleLogin = async ({ email, password }) => {
        const response = await login({ email, password })
        return response
    }

    return { handleRegister, handleLogin }
}