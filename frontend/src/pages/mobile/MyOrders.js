import { useContext } from "react";
import { Link } from "react-router-dom";
import { MainContext } from "providers/MainProvider";
import Header from "common/Header";
import MyOrderItem from "common/MyOrderItem";
import { money, orderTotal } from "static/js/myjs";

const isActive = (o) => o.Status == "A" || o.Status == "P";

const MyOrders = () => {
  const { userOrders, ordersLoading } = useContext(MainContext);

  const active = userOrders.filter(isActive);
  const previous = userOrders.filter((o) => !isActive(o));
  const currentAmount = active.reduce((sum, o) => sum + orderTotal(o), 0);

  return (
    <>
      <div className="mainBg"></div>
      <Header icon="menu" title="My Orders" />
      <div className="bg-background-blue min-h-[90vh] overflow-y-auto shadow-lg rounded-t-3xl noScroll mx-2 p-3">
        {ordersLoading && <div className="h-40 bg-white/70 rounded-2xl animate-pulse" />}

        {!ordersLoading && userOrders.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-600 mb-4">You haven't ordered anything yet.</div>
            <Link to="/" className="bg-background-orange font-semibold rounded-full px-5 py-2 shadow">
              Browse the menu
            </Link>
          </div>
        )}

        {active.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 flex items-center">
              <div className="font-bold flex-1">Active Orders</div>
              <div className="border py-1 border-blue-500 rounded-full px-4 text-blue-600 text-sm">
                Total <span className="font-bold ps-1">{money(currentAmount)}</span>
              </div>
            </div>
            {active.map((order) => (
              <MyOrderItem order={order} key={order.Code} />
            ))}
          </div>
        )}

        {previous.length > 0 && (
          <div>
            <div className="font-bold mb-2">Previous Orders</div>
            {previous.map((order) => (
              <MyOrderItem order={order} key={order.Code} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyOrders;
