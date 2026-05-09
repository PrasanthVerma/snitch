import {configureStore} from '@reduxjs/toolkit'
import authSlice from '../Features/Auth/store/auth.slice.js'


export const store = configureStore({
    reducer:{
        auth:authSlice,
    }
})