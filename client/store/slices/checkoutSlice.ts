import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Address, CheckoutState, PaymentMethod } from '@/types'

const initialState: CheckoutState = {
  step: 'cart',
  shippingAddress: null,
  billingAddress: null,
  paymentMethod: null,
}

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setStep: (
      state,
      action: PayloadAction<'cart' | 'address' | 'payment' | 'confirmation'>
    ) => {
      state.step = action.payload
    },
    setShippingAddress: (state, action: PayloadAction<Address>) => {
      state.shippingAddress = action.payload
    },
    setBillingAddress: (state, action: PayloadAction<Address | null>) => {
      state.billingAddress = action.payload
    },
    setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.paymentMethod = action.payload
    },
    resetCheckout: (state) => {
      state.step = 'cart'
      state.shippingAddress = null
      state.billingAddress = null
      state.paymentMethod = null
    },
  },
})

export const {
  setStep,
  setShippingAddress,
  setBillingAddress,
  setPaymentMethod,
  resetCheckout,
} = checkoutSlice.actions

// Selectors
export const selectCheckoutStep = (state: { checkout: CheckoutState }) =>
  state.checkout.step
export const selectShippingAddress = (state: { checkout: CheckoutState }) =>
  state.checkout.shippingAddress
export const selectBillingAddress = (state: { checkout: CheckoutState }) =>
  state.checkout.billingAddress
export const selectPaymentMethod = (state: { checkout: CheckoutState }) =>
  state.checkout.paymentMethod

export default checkoutSlice.reducer
