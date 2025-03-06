export const rupee = "₹";
export const MENU_IMAGE_PATH = "/menuImages";

export function randomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
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
