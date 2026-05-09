import { register, login, googleAuth } from "../services/auth.api.js"
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
        try {
            const response = await login({ email, password })
            dispatch(setUser(response.user))
            return true;
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || err.message))
            return false;
        } finally {
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

    return { handleRegister, handleLogin, handleGoogleAuth }
}   