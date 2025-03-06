import Dialog from "./Dialog";
import { useContext } from "react";
import { MainContext } from "providers/MainProvider";
import { MENU_IMAGE_PATH, rupee } from "static/js/myjs";
import dummyfood from "static/img/food_dummy.png";

const OrderRecord = ({ onClose }) => {
  const { userOrders } = useContext(MainContext);

  return (
    <>
      <Dialog
        onClose={onClose}
        title={`Your Orders: ${userOrders.length}`}
        open={true}
        className="p-2 w-[calc(100vw-20px)] max-h-[calc(100vh-20px)] overflow-y-auto"
      >
        <div>
          {userOrders.map((order, index) => {
            return (
              <div
                key={"order_" + index}
                className="mb-4 border rounded-md shadow-xl py-2 ps-2 pe-4 relative overflow-hidden"
              >
                <div
                  className={`absolute right-0 top-0 h-full ${
                    order.Status == "A"
                      ? "bg-blue-500"
                      : order.Status == "R"
                      ? "bg-red-500"
                      : order.Status == "S"
                      ? "bg-green-500"
                      : ""
                  } w-1.5`}
                ></div>
                <div className="flex gap-4 items-baseline border-b">
                  <div className="font-bold flex-1">#{order.ShortCode}</div>
                  <div className="border-r pe-2 text-sm">
                    Table No:{" "}
                    <span className="font-bold text-xl">{order.TableNo}</span>
                  </div>
                  {order.Status == "A" && (
                    <div className="text-sm text-blue-500 font-semibold">
                      Preparing
                    </div>
                  )}
                  {order.Status == "R" && (
                    <div className="text-sm text-red-500 font-semibold">
                      Cancelled
                    </div>
                  )}
                  {order.Status == "S" && (
                    <div className="text-sm text-green-500 font-semibold">
                      Completed
                    </div>
                  )}
                </div>
                <div>
                  {order.Items?.map((item, ind) => (
                    <div
                      className="grid items-center border-b grid-cols-12 gap-2"
                      key={"item_" + index + "_" + ind}
                    >
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
                        <div className="text-sm font-semibold">
                          {item.data.Name}
                        </div>
                        <div className="text-xs text-gray-500 flex flex-col mb-1">
                          {item.addons.map((adon) => (
                            <div key={"adon_" + adon.Name}>+ {adon.Name}</div>
                          ))}
                        </div>
                        <div className="text-xs flex">
                          <div className="flex-1 font-bold">
                            {rupee} {item.orderitem.Price}
                          </div>
                          <div className="font-semibold">
                            Qty. {item.orderitem.Quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {order.Note && (
                    <div className="flex gap-2 text-sm mt-2 border-b pb-2">
                      <div className="w-1 rounded-full bg-blue-500"></div>
                      <div className="flex-1">
                        <div className="font-bold underline underline-offset-2">
                          Note
                        </div>
                        <div>{order.Note}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex mt-2">
                    <div>
                      <div className="text-xs">
                        {order.Items?.length}{" "}
                        {order.Items?.length == 1 ? "Item" : "Items"}
                      </div>
                      <div className="text-sm font-bold">
                        Total{" " + rupee}
                        {order.Items?.reduce(
                          (sum, pair) =>
                            sum +
                            pair.orderitem.Price * pair.orderitem.Quantity,
                          0
                        )}
                      </div>
                    </div>
                    <div className="flex-1 text-end">
                      <div className="text-xs">Order Time</div>
                      <div className="text-sm font-bold">{order.OrderTime}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Dialog>
    </>
  );
};

export default OrderRecord;
