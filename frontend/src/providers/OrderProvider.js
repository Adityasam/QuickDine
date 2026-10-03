import React, { createContext, useState } from "react";

// Create a Context
export const OrderContext = createContext();

export const itemDefault = {
  options: {},
  info: {
    quantity: 1,
    price: 0,
    name: "",
    image: "",
  },
};

export const orderDefault = {
  code: "",
  note: "",
  items: {},
};

// Create a Provider Component
export const OrderProvider = ({ children }) => {
  const [orderForm, setOrderForm] = useState(() => structuredClone(orderDefault));

  return (
    <OrderContext.Provider value={{ orderForm, setOrderForm }}>
      {children}
    </OrderContext.Provider>
  );
};
