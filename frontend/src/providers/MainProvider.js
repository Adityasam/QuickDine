import React, { createContext, useState, useEffect } from "react";
import { generateSecureRandomString } from "static/js/myjs";
import { getMyOrders } from "apis/menu";
import { useQuery } from "@tanstack/react-query";

// Create a Context
export const MainContext = createContext();

// Create a Provider Component
export const MainProvider = ({ children }) => {
  const [userOrders, setUserOrders] = useState([]);

  let userId = localStorage.getItem("USERID");

  if (!userId) {
    userId = generateSecureRandomString(20);
    localStorage.setItem("USERID", userId);
  }

  const { data: myorders } = useQuery({
    queryKey: ["getMyOrders"],
    queryFn: getMyOrders,
  });

  useEffect(() => {
    if (myorders && myorders.data) {
      setUserOrders(
        myorders.data.sort((a) =>
          a.Status === "A" || a.Status === "P" ? -1 : 1
        )
      );
    }
  }, [myorders]);

  return (
    <MainContext.Provider value={{ userOrders, setUserOrders }}>
      {children}
    </MainContext.Provider>
  );
};
