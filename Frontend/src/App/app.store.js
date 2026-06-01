import {configureStore} from '@reduxjs/toolkit'
import authSlice from '../Features/Auth/store/auth.slice.js'
import productSlice from '../Features/Products/store/product.slice.js'


export const store = configureStore({
    reducer:{
        auth:authSlice,
        product:productSlice
    }
})