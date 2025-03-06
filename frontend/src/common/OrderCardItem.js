import { MENU_IMAGE_PATH, rupee } from "static/js/myjs";
import dummyfood from "static/img/food_dummy.png";

const OrderCardItem = ({ item }) => {
  return (
    <>
      <div className="grid items-center border-b grid-cols-12 gap-2">
        <div className="col-span-4">
          <img
            src={
              item.images.length > 0
                ? process.env.REACT_APP_PUBLIC_URL +
                  MENU_IMAGE_PATH +
                  "/" +
                  item.data.Code +
                  "/" +
                  item.images[0]
                : dummyfood
            }
          />
        </div>
        <div className="col-span-8">
          <div className="text-sm font-semibold">{item.data.Name}</div>
          <div className="text-xs text-gray-500 flex flex-col mb-1">
            {item.addons.map((adon) => (
              <div key={"adon_" + adon.Name}>+ {adon.Name}</div>
            ))}
          </div>
          <div className="text-xs flex">
            <div className="flex-1 font-bold">
              {rupee} {item.orderitem.Price}
            </div>
            <div className="font-semibold">Qty. {item.orderitem.Quantity}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderCardItem;
