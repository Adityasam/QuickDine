import { api } from "static/js/myjs";

export const getOrders = ({ queryKey: [, status] }) => api("/get_orders", { status });
export const getOrderStatusCount = () => api("/get_order_status_count");
export const updateOrderStatus = (data) => api("/update_order_status", data);
export const getOpenTables = () => api("/get_open_tables");
export const getTableBill = ({ queryKey: [, tableno] }) => api("/get_table_bill", { tableno });
export const settleTable = (data) => api("/settle_table", data);
export const getServiceRequests = () => api("/get_service_requests");
export const resolveServiceRequest = (id) => api("/resolve_service_request", { id });
