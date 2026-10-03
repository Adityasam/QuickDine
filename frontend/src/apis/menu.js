import { api } from "static/js/myjs";

export const getCategory = () => api("/get_category");
export const saveMenuItem = (data) => api("/save_menu_item", data);
export const saveOrder = (data) => api("/save_order", data);
export const updateMenuItemsStatus = (data) => api("/update_menu_item_staus", data);
export const submitReview = (data) => api("/submit_review", data);
export const getMenuDesktop = () => api("/get_menu_desktop");
export const getMenuMobile = () => api("/get_menu_mobile");
export const getMyOrders = () => api("/get_my_orders", { userid: localStorage.getItem("USERID") });
export const getSingleMenuItem = ({ queryKey: [, code] }) => api("/get_single_menu_item", { code });
export const requestService = (type) =>
  api("/service_request", {
    type,
    tableno: sessionStorage.getItem("TABLENO"),
    userid: localStorage.getItem("USERID"),
  });
