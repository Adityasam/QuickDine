import { api } from "static/js/myjs";

export const getDashboardStats = (period) => api("/get_dashboard_stats", { period });
export const getCustomerMapStats = (period) => api("/get_customer_map_stats", { period });
