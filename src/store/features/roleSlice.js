import { createSlice } from "@reduxjs/toolkit"

const initialState = { roles: [] }

const roleSlice = createSlice({
    name: "roles",
    initialState,
    reducers: {
        refreshRoles(state, action) {
            console.log(action)
            state.roles = action.payload
        },
    }
})

export const roleSliceActions = roleSlice.actions

export default roleSlice.reducer
