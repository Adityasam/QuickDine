import { useContext } from "react";
import { MainContext } from "providers/MainProvider";
import Header from "common/Header";
import MyOrderItem from "common/MyOrderItem";
import { rupee } from "static/js/myjs";

const MyOrders = () => {
  const { userOrders } = useContext(MainContext);

  let currentAmount = 0;
  userOrders?.forEach((order) => {
    if (order.Status == "A" || order.Status == "P") {
      currentAmount += order.Items?.reduce(
        (sum, pair) => sum + pair.orderitem.Price * pair.orderitem.Quantity,
        0
      );
    }
  });

  return (
    <>
      <div className="mainBg"></div>
      <Header icon="menu" title="My Orders" />
      <div className="bg-background-blue min-h-[90vh] overflow-y-auto shadow-lg rounded-t-3xl noScroll mx-2 p-2">
        <div>
          <div className="mb-2 flex">
            <div className="font-bold bg-blue-500 text-white inline-block pe-6 rounded-r-full ps-2 -ms-2 py-1 shadow-xl">
              Active Orders
            </div>
            <div className="flex-1 flex justify-end">
              <div className="border py-1 border-blue-500 rounded-full px-4 text-blue-500">
                <span>Total</span>
                <span className="font-bold ps-2">
                  {rupee}
                  {currentAmount}
                </span>
              </div>
            </div>
          </div>
          {userOrders.map((order, index) => {
            if (order.Status == "A" || order.Status == "P") {
              return <MyOrderItem order={order} key={"Order_" + index} />;
            }
          })}
        </div>
        <div>
          <div className="font-bold mb-2">
            <div className="bg-green-500 text-white inline-block pe-6 rounded-r-full ps-2 -ms-2 py-1 shadow-xl">
              Previous Orders
            </div>
          </div>
          {userOrders.map((order, index) => {
            if (order.Status != "A" && order.Status != "P") {
              return <MyOrderItem order={order} key={"Order_" + index} />;
            }
          })}
        </div>
      </div>
    </>
  );
};

export default MyOrders;
