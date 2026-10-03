import React, { createContext } from "react";
import { generateSecureRandomString } from "static/js/myjs";
import { getMyOrders } from "apis/menu";
import { useQuery } from "@tanstack/react-query";

export const MainContext = createContext();

export const MainProvider = ({ children }) => {
  if (!localStorage.getItem("USERID")) {
    localStorage.setItem("USERID", generateSecureRandomString(20));
  }

  const { data: myorders, isLoading: ordersLoading } = useQuery({
    queryKey: ["getMyOrders"],
    queryFn: getMyOrders,
    refetchInterval: 20000, // live order status for the customer
  });

  return (
    <MainContext.Provider value={{ userOrders: myorders?.data || [], ordersLoading }}>
      {children}
    </MainContext.Provider>
  );
};
