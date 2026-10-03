export const rupee = "₹";
export const MENU_IMAGE_PATH = "/menuImages";

// Staff pages per role; first entry is the landing page. Mirrors role_required() in app.py.
export const ROLE_PAGES = {
  admin: ["dashboard", "orders", "menu", "reviews", "settings"],
  staff: ["orders"],
  kitchen: ["orders"],
};

// All backend routes accept POST. Sends JSON, or FormData as-is; keeps the session cookie.
export async function api(path, body) {
  const opts = { method: "POST", credentials: "include" };
  if (body instanceof FormData) {
    opts.body = body;
  } else if (body !== undefined) {
    opts.body = JSON.stringify(body);
    opts.headers = { "Content-Type": "application/json" };
  }
  const res = await fetch(process.env.REACT_APP_PUBLIC_URL + path, opts);
  // session expired / user deactivated while on a staff page
  if (res.status === 401 && window.location.pathname.startsWith("/desktop")) {
    window.location.href = "/login";
  }
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

export async function urlToFile(url, filename) {
  const response = await fetch(url); // Fetch the image from the URL
  const blob = await response.blob(); // Convert the response to a Blob
  return new File([blob], filename); // Create a File object
}

export function getTotalAmount(orderForm) {
  let totalPrice = 0;
  if (orderForm && Object.keys(orderForm.items).length > 0) {
    Object.keys(orderForm.items).forEach((item) => {
      let itemprice = orderForm.items[item].info.price;
      const itemqt = orderForm.items[item].info.quantity;
      const options = orderForm.items[item].options;
      Object.keys(options).forEach((option) => {
        const itemdata = options[option];
        Object.keys(itemdata).forEach((itemkey) => {
          const i = itemdata[itemkey];
          itemprice += i.price;
        });
      });
      totalPrice += itemprice * itemqt;
    });
  }
  return totalPrice;
}

export function generateSecureRandomString(length = 10) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);

  return Array.from(array, (byte) => characters[byte % characters.length]).join(
    ""
  );
}

export function imageUrl(code, file) {
  return process.env.REACT_APP_PUBLIC_URL + MENU_IMAGE_PATH + "/" + code + "/" + file;
}

// Avoids float noise like 0.1 + 0.2 = 0.30000000000000004
export function money(n) {
  return rupee + " " + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

// Server order shape: Items[].orderitem {Price, Quantity} + Items[].addons[] {Price}
export function orderTotal(order) {
  return (order?.Items || []).reduce((sum, it) => {
    const addons = (it.addons || []).reduce((s, a) => s + a.Price, 0);
    return sum + (it.orderitem.Price + addons) * it.orderitem.Quantity;
  }, 0);
}

// Full class names so Tailwind can see them
export const ORDER_STATUS = {
  P: { label: "Order received", badge: "bg-amber-100 text-amber-700", bar: "bg-amber-400", border: "border-amber-400" },
  A: { label: "Preparing", badge: "bg-blue-100 text-blue-700", bar: "bg-blue-500", border: "border-blue-500" },
  S: { label: "Completed", badge: "bg-green-100 text-green-700", bar: "bg-green-500", border: "border-green-500" },
  R: { label: "Cancelled", badge: "bg-red-100 text-red-700", bar: "bg-red-500", border: "border-red-500" },
};
