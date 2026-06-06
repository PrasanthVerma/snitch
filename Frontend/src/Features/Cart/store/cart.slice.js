import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name:"cart",
    initialState:{
        items:[],
        totalPrice:0,
    },
    reducers:{
        setCart:(state,action)=>{
            const items = action.payload?.items || []
            state.items = items
            state.totalPrice = items.reduce((total, item) => {
                const amount = item.price?.amount || 0
                return total + (amount * item.quantity)
            }, 0)
        },
        addItem:(state,action)=>{
            state.items.push(action.payload)
            const amount = action.payload.price?.amount || 0
            const quantity = action.payload.quantity || 1
            state.totalPrice += amount * quantity
        }
    }
})

export const {setCart,addItem} = cartSlice.actions
export default cartSlice.reducer