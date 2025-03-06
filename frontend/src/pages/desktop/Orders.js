import { useState } from "react";
import { Timer } from "lucide-react";
import { rupee } from "static/js/myjs";
import PageSearch from "common/PageSearch";
import { useQuery, useMutation } from "@tanstack/react-query";
import dummyfood from "static/img/food_dummy.png";
import { updateOrderStatus, getOrders, getOrderStatusCount } from "apis/orders";
import { toast } from "react-toastify";
import Confirmation from "common/Confirmation";
import ReceivePayment from "common/ReceivePayment";
import OrderCardItem from "common/OrderCardItem";

const Orders = () => {
  const [orderStatus, setOrderStatus] = useState("P");
  const [orderCancelProp, setOrderCancelProp] = useState({});
  const [searchText, setSearchText] = useState("");
  const [receiveOrderCode, setReceiveOrderCode] = useState("");

  const { data: orderList, refetch: refetchOrderList } = useQuery({
    queryKey: ["getOrders", orderStatus],
    queryFn: getOrders,
  });

  const { data: orderStatusCount, refetch: refetchOrderStatusCount } = useQuery(
    {
      queryKey: ["getOrderStatusCount"],
      queryFn: getOrderStatusCount,
    }
  );

  const updateMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: (d, v) => {
      if (d.status == 1) {
        if (v.status == "S") {
          toast.success("Order Completed");
        } else if (v.status == "R") {
          toast.success("Order Cancelled");
        }
        refetchOrderList();
        refetchOrderStatusCount();
        setOrderCancelProp({});
      } else if (d.status == 0) {
        toast.success("Order not found");
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("An error occured");
    },
  });

  function updateStatus(code, status) {
    updateMutation.mutate({ code, status });
  }

  function askCancelConfirm(order) {
    setOrderCancelProp({
      code: order.Code,
      shortcode: order.ShortCode,
    });
  }

  function onOrderCancelDismiss() {
    setOrderCancelProp({});
  }
  function onOrderCancelConfirm() {
    updateStatus(orderCancelProp.code, "R");
  }

  const statusBtns = [
    { title: "New Orders", code: "P" },
    { title: "Preparing", code: "A" },
    { title: "Completed", code: "S" },
    { title: "Rejected", code: "R" },
  ];

  return (
    <>
      {receiveOrderCode != "" && (
        <ReceivePayment
          orderCode={receiveOrderCode}
          onCancel={() => setReceiveOrderCode("")}
          onConfirm={() => {
            setReceiveOrderCode("");
            refetchOrderList();
          }}
        />
      )}
      {Object.keys(orderCancelProp).length > 0 && (
        <Confirmation
          message={
            <div>
              <span>Are you sure you want to cancel the order </span>
              <span className="font-bold">#{orderCancelProp.shortcode}</span>
            </div>
          }
          onCancel={onOrderCancelDismiss}
          onConfirm={onOrderCancelConfirm}
          title="Cancelling Order"
          confirmBtn="Cancel Order"
          cancelBtn=""
        />
      )}
      <div className="flex items-center mb-4">
        <div className="text-2xl font-semibold me-6">Orders</div>
        <PageSearch onChange={(e) => setSearchText(e)} />
        <div className="flex-1 flex justify-end font-semibold">
          {statusBtns.map((status, index) => (
            <div
              key={"st_" + index}
              onClick={() => setOrderStatus(status.code)}
              className={`border-2 me-4 rounded-full px-4 py-1.5 cursor-pointer transition-all duration-200 ${
                orderStatus == status.code
                  ? "bg-background-orange text-white shadow-xl"
                  : "border-background-orange"
              }`}
            >
              <span className="border-r pe-2">{status.title}</span>
              <span className="ps-2">
                {orderStatusCount &&
                orderStatusCount.data &&
                status.code in orderStatusCount.data
                  ? orderStatusCount.data[status.code]
                  : 0}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6">
        {orderList &&
          orderList.data &&
          (orderList.data.length == 0 ? (
            <div className="col-span-4 relative h-[60vh]">
              <div className="text-2xl py-2 px-8 font-semibold absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4">
                No Order Found
              </div>
            </div>
          ) : (
            orderList.data.map((card, index) => {
              if (
                card.ShortCode.includes(searchText.toLowerCase()) ||
                card.Items.find((it) =>
                  it.data.Name.toLowerCase().includes(searchText.toLowerCase())
                ) ||
                ("0" + card.TableNo.toString().slice(-2)).includes(
                  searchText.toLowerCase()
                )
              ) {
                return (
                  <div
                    style={{ animationDelay: (index + 1) * 100 + "ms" }}
                    key={"card_" + index}
                    className="col-span-1 relative bg-white opacity-0 py-4 animate-fadeIn px-6 rounded-xl shadow-2xl flex flex-col"
                  >
                    <div className="mb-2">
                      <div className="text-lg font-semibold">
                        Order #{card.ShortCode}
                      </div>
                      <div className="text-xs text-gray-500">{card.Time}</div>
                    </div>
                    <div
                      className="bg-background-orange w-14 h-14 text-3xl font-bold shadow-xl 
              justify-center items-center flex rounded-tr-xl text-white absolute top-0 right-0"
                    >
                      {("0" + card.TableNo).slice(-2)}
                    </div>
                    <div className="flex-1">
                      {card.Items?.map((item, ind) => (
                        <OrderCardItem
                          key={"item_" + index + "_" + ind}
                          item={item}
                        />
                      ))}
                    </div>
                    {card.Note && (
                      <div className="flex gap-2 text-sm mt-2 border-b pb-2">
                        <div className="w-1 rounded-full bg-blue-500"></div>
                        <div className="flex-1">
                          <div className="font-bold underline underline-offset-2">
                            Note
                          </div>
                          <div>{card.Note}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex mt-2 gap-2 items-baseline">
                      <div className="text-sm">
                        {card.Items?.length}{" "}
                        {card.Items?.length == 1 ? "Item" : "Items"}
                      </div>
                      <div className="text-sm flex-1 font-bold">
                        Total{" " + rupee}
                        {card.Items?.reduce(
                          (sum, pair) =>
                            sum +
                            pair.orderitem.Price * pair.orderitem.Quantity,
                          0
                        )}
                      </div>
                      <div>
                        {card.PaymentStatus == "P" && (
                          <div className="flex justify-end font-bold text-green-500 text-sm">
                            Payment Done
                          </div>
                        )}
                      </div>
                    </div>
                    {card.Status == "A" && (
                      <div className="flex mt-2">
                        <div className="flex items-center">
                          <Timer size={16} />
                          <div className="text-sm ps-2">
                            {card.TimeElapsed}min
                          </div>
                        </div>
                        <div className="flex-1 flex gap-2 justify-end text-sm">
                          <button
                            onClick={() => askCancelConfirm(card)}
                            className="btn border-2 rounded-full px-2 py-1 text-red-500 border-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => updateStatus(card.Code, "S")}
                            className="btn border-2 rounded-full px-2 py-1 text-green-500 border-green-500 hover:bg-green-500 hover:text-white transition-all duration-200"
                          >
                            Complete
                          </button>
                        </div>
                      </div>
                    )}
                    {card.Status == "P" && (
                      <div className="flex items-end mt-1 pt-2 border-t">
                        <div className="flex-1">
                          <div className="text-xs">Payment</div>
                          {card.PaymentStatus == "P" ? (
                            <div className="text-green-500 font-bold">Paid</div>
                          ) : (
                            <div className="text-blue-500 font-bold">
                              Pay Later
                            </div>
                          )}
                        </div>
                        <div>
                          <button
                            onClick={() => updateStatus(card.Code, "A")}
                            className="btn border-2 rounded-full px-2 py-1 text-green-500 border-green-500 hover:bg-green-500 hover:text-white transition-all duration-200"
                          >
                            Accept Order
                          </button>
                        </div>
                      </div>
                    )}
                    {card.Status == "S" && card.PaymentStatus == "L" && (
                      <div className="text-end mt-1 pt-2 border-t">
                        <button
                          onClick={() => setReceiveOrderCode(card.Code)}
                          className="btn border-2 rounded-full px-2 py-1 text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200"
                        >
                          Receive Payment
                        </button>
                      </div>
                    )}
                  </div>
                );
              }
            })
          ))}
      </div>
    </>
  );
};

export default Orders;
