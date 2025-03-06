import axios from "axios";

export async function getSettings() {
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/get_settings"
  );
  return response.data;
}

export async function getTableList() {
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/get_table_list"
  );
  return response.data;
}

export async function getUserList() {
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/get_user_list"
  );
  return response.data;
}

export async function getReviewList() {
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/get_review_list"
  );
  return response.data;
}

export async function getUserDetail({ queryKey }) {
  const [, id] = queryKey;
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/get_user_detail",
    { userid: id }
  );
  return response.data;
}

export async function saveTable(data) {
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/save_table",
    data
  );
  return response.data;
}

export async function saveUser(data) {
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/save_user",
    data
  );
  return response.data;
}

export async function deleteTable(tableno) {
  const response = await axios.post(
    process.env.REACT_APP_PUBLIC_URL + "/delete_table",
    { tableno: tableno }
  );
  return response.data;
}
