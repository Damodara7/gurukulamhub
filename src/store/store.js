import { configureStore } from '@reduxjs/toolkit'
import roleReducer from './features/roleSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      role: roleReducer,
    },
  })
}
