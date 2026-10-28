import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Address, CheckoutState, PaymentMethod } from '@/types'
import type { Address as ApiAddress } from '@/api/address'

const initialState: CheckoutState = {
  step: 'cart',
  shippingAddress: null,
  billingAddress: null,
  paymentMethod: null,
  addressPickerOpen: false,
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
    setShippingAddress: (state, action: PayloadAction<ApiAddress>) => {
      state.shippingAddress = {
        id: action.payload.id,
        street: action.payload.street,
        landmark: action.payload.landmark,
        pincode: action.payload.pincode,
        state: action.payload.state,
        district: action.payload.district,
        type: action.payload.type,
        createdAt: action.payload.createdAt,
      }
    },
    setAddressPickerOpen: (state, action: PayloadAction<boolean>) => {
      state.addressPickerOpen = action.payload
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
      state.addressPickerOpen = false
    },
  },
})

export const {
  setStep,
  setShippingAddress,
  setAddressPickerOpen,
  setBillingAddress,
  setPaymentMethod,
  resetCheckout,
} = checkoutSlice.actions

// Selectors
export const selectCheckoutStep = (state: { checkout: CheckoutState }) =>
  state.checkout.step
export const selectShippingAddress = (state: { checkout: CheckoutState }) =>
  state.checkout.shippingAddress
export const selectAddressPickerOpen = (state: { checkout: CheckoutState }) =>
  state.checkout.addressPickerOpen
export const selectBillingAddress = (state: { checkout: CheckoutState }) =>
  state.checkout.billingAddress
export const selectPaymentMethod = (state: { checkout: CheckoutState }) =>
  state.checkout.paymentMethod

export default checkoutSlice.reducer
