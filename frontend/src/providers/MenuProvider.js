import React, { createContext, useState } from "react";

// Create a Context
export const MenuContext = createContext();

export const itemFormDefault = {
  code: "",
  name: "",
  description: "",
  category: "",
  price: 0,
  available: "1",
  optionGroup: [],
  images: [],
  tags: [],
  prepTime: 0,
};

// Create a Provider Component
export const MenuProvider = ({ children }) => {
  const [itemForm, setItemForm] = useState({ ...itemFormDefault });

  return (
    <MenuContext.Provider value={{ itemForm, setItemForm }}>
      {children}
    </MenuContext.Provider>
  );
};
