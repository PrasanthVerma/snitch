import { register, login, getMe, googleAuth } from "../services/auth.api.js"
import { useDispatch } from "react-redux"
import { setError, setLoading, setUser } from "../store/auth.slice.js"

export const useAuth = () => {
    const dispatch = useDispatch();
    const handleRegister = async ({ fullname, email, contact, password, isSeller }) => {
        dispatch(setLoading(true))
        try {
            const response = await register({ fullname, email, contact, password, isSeller })
            dispatch(setUser(response.user))
            return true;
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || err.message))
            return false;
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleLogin = async ({ email, password }) => {
        dispatch(setLoading(true))
        dispatch(setError(null))
        try {
            const response = await login({ email, password })
            if (!response?.user) {
                throw new Error("Login did not return user data")
            }
            dispatch(setUser(response.user))
            return response.user
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || err.message))
            return null
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleGetMe = async () => {
        dispatch(setLoading(true))
        try {
            const response = await getMe()
            dispatch(setUser(response.user))
        }
        catch (err) {
            // Background check for current session: failure simply means unauthenticated.
            // Do not pollute user-facing error state.
        }
        finally {
            dispatch(setLoading(false))
        }
    }

    const handleGoogleAuth = async () => {
        dispatch(setLoading(true))
        try {
            const response = await googleAuth()
            dispatch(setUser(response.user))
            return true;
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || err.message))
            return false;
        } finally {
            dispatch(setLoading(false))
        }
    }

    const clearError = () => {
        dispatch(setError(null))
    }

    return { handleRegister, handleLogin, handleGetMe, handleGoogleAuth, clearError }
}   