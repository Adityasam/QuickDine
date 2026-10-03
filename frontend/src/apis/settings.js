import { api } from "static/js/myjs";

export const getTableList = () => api("/get_table_list");
export const getUserList = () => api("/get_user_list");
export const getReviewList = () => api("/get_review_list");
export const getUserDetail = ({ queryKey: [, userid] }) => api("/get_user_detail", { userid });
export const saveTable = (data) => api("/save_table", data);
export const saveUser = (data) => api("/save_user", data);
export const deleteTable = (tableno) => api("/delete_table", { tableno });
export const saveCategory = (data) => api("/save_category", data);
export const getCategoryList = () => api("/get_category_list");
