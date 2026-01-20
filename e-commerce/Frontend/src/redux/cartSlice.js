import { createSlice } from "@reduxjs/toolkit";

const getCartFromStorage = () => {
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
};

const initialState = {
  cart: getCartFromStorage(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.cart.push(action.payload);
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    removeCart: (state, action) => {
      // console.log("00000000000", action.payload.id);
      const cartData = state.cart.filter(
        (item) => item.id != action.payload.id,
      );

      state.cart = cartData;
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
  },
});

export const { setCart, removeCart } = cartSlice.actions;
export default cartSlice.reducer;
