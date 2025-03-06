import axios from "axios";

export async function getCategory() {
  const response = await axios.get(
    process.env.REACT_APP_PUBLIC_URL + "/get_category"
  );
  return response.data;
}

export async function saveMenuItem(data) {
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/save_menu_item",
    data,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}

export async function saveOrder(data) {
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/save_order",
    data
  );
  return response.data;
}

export async function updateMenuItemsStatus(data) {
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/update_menu_item_staus",
    data
  );
  return response.data;
}

export async function submitReview(data) {
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/submit_review",
    data
  );
  return response.data;
}

export async function getMenuDesktop({ queryKey }) {
  const [_, pageIndex] = queryKey;
  const response = await axios.get(
    process.env.REACT_APP_PUBLIC_URL + "/get_menu_desktop",
    { pageIndex: pageIndex }
  );
  return response.data;
}

export async function getMyOrders() {
  const userid = localStorage.getItem("USERID");
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/get_my_orders",
    { userid }
  );
  return response.data;
}

export async function getMenuMobile() {
  const response = await axios.get(
    process.env.REACT_APP_PUBLIC_URL + "/get_menu_mobile"
  );
  return response.data;
}

export async function getSingleMenuItem({ queryKey }) {
  const [, id] = queryKey;
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/get_single_menu_item",
    { code: id }
  );
  return response.data;
}
