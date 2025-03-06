import axios from "axios";

export async function getOrders({ queryKey }) {
  const [_, status] = queryKey;
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/get_orders",
    { status }
  );
  return response.data;
}

export async function getOrderStatusCount() {
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/get_order_status_count"
  );
  return response.data;
}

export async function updateOrderStatus(data) {
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/update_order_status",
    data
  );
  return response.data;
}

export async function confirmOrderPayment(data) {
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/confirm_order_payment",
    data
  );
  return response.data;
}

export async function getSingleOrder({ queryKey }) {
  const [, code] = queryKey;
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/get_single_order",
    { code: code }
  );
  return response.data;
}
