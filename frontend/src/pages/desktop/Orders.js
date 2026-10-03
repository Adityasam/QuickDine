import { useState, useEffect, useRef, useContext } from "react";
import { Timer, BellRing, Receipt } from "lucide-react";
import { money, orderTotal } from "static/js/myjs";
import PageSearch from "common/PageSearch";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  updateOrderStatus,
  getOrders,
  getOrderStatusCount,
  getOpenTables,
  getServiceRequests,
  resolveServiceRequest,
} from "apis/orders";
import { DesktopMainContext } from "providers/DesktopMainProvider";
import { toast } from "react-toastify";
import Confirmation from "common/Confirmation";
import TableBill from "common/TableBill";
import OrderCardItem from "common/OrderCardItem";
import CreateOrderDialog from "common/CreateOrderDialog";
import { Plus } from "lucide-react";

const Orders = () => {
  const [orderStatus, setOrderStatus] = useState("P");
  const [orderCancelProp, setOrderCancelProp] = useState({});
  const [searchText, setSearchText] = useState("");
  const [billTable, setBillTable] = useState(null);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const { userInfo } = useContext(DesktopMainContext);
  const canBill = userInfo?.role !== "kitchen"; // kitchen sees the board only

  const { data: orderList, refetch: refetchOrderList } = useQuery({
    queryKey: ["getOrders", orderStatus],
    queryFn: getOrders,
    enabled: orderStatus !== "BILL",
    refetchInterval: 15000, // keep the kitchen board live
  });

  const { data: openTables, refetch: refetchOpenTables } = useQuery({
    queryKey: ["getOpenTables"],
    queryFn: getOpenTables,
    enabled: canBill,
    refetchInterval: 15000,
  });

  const { data: serviceReqs, refetch: refetchServiceReqs } = useQuery({
    queryKey: ["getServiceRequests"],
    queryFn: getServiceRequests,
    enabled: canBill,
    refetchInterval: 10000,
  });
  const requests = serviceReqs?.data || [];

  // Toast when a table calls while the page is open
  const prevReqIds = useRef(null);
  useEffect(() => {
    if (!serviceReqs) return;
    const ids = requests.map((r) => r.id);
    if (prevReqIds.current) {
      requests
        .filter((r) => !prevReqIds.current.includes(r.id))
        .forEach((r) =>
          toast.warn(`Table ${r.TableNo} ${r.Type === "bill" ? "asked for the bill" : "is calling a waiter"}`)
        );
    }
    prevReqIds.current = ids;
  }, [serviceReqs]);

  const resolveMutation = useMutation({
    mutationFn: resolveServiceRequest,
    onSuccess: () => refetchServiceReqs(),
  });

  const { data: orderStatusCount, refetch: refetchOrderStatusCount } = useQuery(
    {
      queryKey: ["getOrderStatusCount"],
      queryFn: getOrderStatusCount,
      refetchInterval: 15000,
    }
  );

  // Toast when new orders arrive while the page is open
  const newCount = orderStatusCount ? orderStatusCount.data?.P || 0 : null;
  const prevNewCount = useRef(null);
  useEffect(() => {
    if (newCount === null) return;
    if (prevNewCount.current !== null && newCount > prevNewCount.current) {
      toast.info("New order received");
      if (orderStatus === "P") refetchOrderList();
    }
    prevNewCount.current = newCount;
  }, [newCount]);

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
        toast.error("Order not found");
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
    { title: "Cancelled", code: "R" },
    ...(canBill ? [{ title: "Table Bills", code: "BILL" }] : []),
  ];
  const counts = { ...(orderStatusCount?.data || {}), BILL: openTables?.data?.length || 0 };

  return (
    <>
      {billTable !== null && (
        <TableBill
          tableNo={billTable}
          onClose={() => setBillTable(null)}
          onSettled={() => {
            setBillTable(null);
            refetchOrderList();
            refetchOpenTables();
            refetchServiceReqs();
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
          cancelBtn="Keep Order"
        />
      )}
      {createOrderOpen && (
        <CreateOrderDialog
          open={createOrderOpen}
          onClose={() => setCreateOrderOpen(false)}
          onSuccess={() => {
            setCreateOrderOpen(false);
            refetchOrderList();
            refetchOrderStatusCount();
          }}
        />
      )}
      <div className="flex flex-wrap gap-y-3 items-center mb-4">
        <div className="text-2xl font-semibold me-6">Orders</div>
        {canBill && (
          <button
            onClick={() => setCreateOrderOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all active:scale-95 me-4"
          >
            <Plus size={20} />
            <span>New Order</span>
          </button>
        )}
        <PageSearch onChange={(e) => setSearchText(e)} />
        <div className="flex-1 flex flex-wrap gap-y-2 justify-end font-semibold">
          {statusBtns.map((status, index) => (
            <div
              key={"st_" + index}
              onClick={() => setOrderStatus(status.code)}
              className={`border-2 ms-2 whitespace-nowrap text-sm rounded-full px-3 py-1.5 cursor-pointer transition-all duration-200 ${orderStatus == status.code
                ? "bg-background-orange text-white shadow-xl"
                : "border-background-orange"
                }`}
            >
              <span className="border-r pe-2">{status.title}</span>
              <span className="ps-2">{counts[status.code] || 0}</span>
            </div>
          ))}
        </div>
      </div>
      {canBill && requests.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {requests.map((r) => (
            <div
              key={r.id}
              className={`flex items-center gap-2 rounded-full ps-3 pe-1 py-1 text-sm font-semibold shadow ${
                r.Type === "bill" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800 animate-pulse"
              }`}
            >
              {r.Type === "bill" ? <Receipt size={16} /> : <BellRing size={16} />}
              <span>
                Table {r.TableNo} · {r.Type === "bill" ? "Bill requested" : "Calling waiter"} · {r.Minutes}m
              </span>
              {r.Type === "bill" && (
                <button
                  onClick={() => setBillTable(r.TableNo)}
                  className="bg-white rounded-full px-3 py-0.5 hover:shadow"
                >
                  Open bill
                </button>
              )}
              <button
                onClick={() => resolveMutation.mutate(r.id)}
                className="bg-white rounded-full px-3 py-0.5 hover:shadow"
              >
                Done
              </button>
            </div>
          ))}
        </div>
      )}

      {orderStatus === "BILL" && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {(openTables?.data || []).length === 0 && (
            <div className="col-span-full h-[40vh] flex items-center justify-center text-xl text-gray-400 font-semibold">
              No unpaid tables right now
            </div>
          )}
          {(openTables?.data || []).map((t) => (
            <button
              key={t.TableNo}
              onClick={() => setBillTable(t.TableNo)}
              className="bg-white rounded-xl shadow-xl p-4 text-left hover:shadow-2xl transition-shadow relative"
            >
              <div className="text-xs text-gray-500">Table</div>
              <div className="text-3xl font-bold">{t.TableNo}</div>
              <div className="text-sm mt-2">
                {t.orders} {t.orders === 1 ? "order" : "orders"}
              </div>
              <div className="text-lg font-bold">{money(t.total)}</div>
              {requests.some((r) => r.Type === "bill" && String(r.TableNo) === String(t.TableNo)) && (
                <span className="absolute top-3 right-3 text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5 font-semibold">
                  Bill requested
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {orderStatus !== "BILL" &&
          orderList &&
          orderList.data &&
          (orderList.data.length == 0 ? (
            <div className="col-span-full h-[50vh] flex items-center justify-center text-xl text-gray-400 font-semibold">
              No {statusBtns.find((s) => s.code == orderStatus)?.title.toLowerCase()} right now
            </div>
          ) : (
            orderList.data.map((card, index) => {
              const q = searchText.toLowerCase();
              if (
                (card.ShortCode || "").includes(q) ||
                card.Items.find((it) => (it.data.Name || "").toLowerCase().includes(q)) ||
                String(card.TableNo ?? "").includes(q)
              ) {
                return (
                  <div
                    style={{ animationDelay: (index + 1) * 100 + "ms" }}
                    key={card.Code}
                    className="col-span-1 relative bg-white opacity-0 py-4 animate-fadeIn px-6 rounded-xl shadow-2xl flex flex-col"
                  >
                    <div className="mb-2">
                      <div className="text-lg font-semibold">
                        Order #{card.ShortCode}
                      </div>
                      <div className="text-xs text-gray-500 font-semibold">{card.OrderTime}</div>
                    </div>
                    <div
                      className="bg-background-orange w-14 h-14 text-3xl font-bold shadow-xl 
              justify-center items-center flex rounded-tr-xl text-white absolute top-0 right-0"
                    >
                      {("0" + card.TableNo).slice(-2)}
                    </div>
                    <div className="flex-1 max-h-64 overflow-y-auto">
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
                        Total {money(orderTotal(card))}
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
                        <div
                          title="Time since order"
                          className={`flex items-center ${card.TimeElapsed > 20 ? "text-red-500 font-bold" : ""}`}
                        >
                          <Timer size={16} />
                          <div className="text-sm ps-2">{card.TimeElapsed} min</div>
                        </div>
                        <div className="flex-1 flex gap-2 justify-end text-sm">
                          <button
                            onClick={() => askCancelConfirm(card)}
                            className="btn border-2 rounded-full text-xs px-2 py-1 text-red-500 border-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={updateMutation.isPending}
                            onClick={() => updateStatus(card.Code, "S")}
                            className="btn border-2 rounded-full text-xs px-2 py-1 text-green-500 border-green-500 hover:bg-green-500 hover:text-white transition-all duration-200"
                          >
                            Complete
                          </button>
                        </div>
                      </div>
                    )}
                    {card.Status == "P" && (
                      <div className="flex items-end justify-end gap-2 mt-1 pt-2 border-t">
                        <div>
                          <button
                            onClick={() => askCancelConfirm(card)}
                            className="btn border-2 rounded-full text-xs px-2 py-1 text-red-500 border-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                        <div>
                          <button
                            disabled={updateMutation.isPending}
                            onClick={() => updateStatus(card.Code, "A")}
                            className="btn border-2 rounded-full text-xs px-2 py-1 text-green-500 border-green-500 hover:bg-green-500 hover:text-white transition-all duration-200"
                          >
                            Accept Order
                          </button>
                        </div>
                      </div>
                    )}
                    {canBill && card.Status == "S" && card.PaymentStatus == "L" && (
                      <div className="text-end mt-1 pt-2 border-t">
                        <button
                          onClick={() => setBillTable(card.TableNo)}
                          className="btn border-2 rounded-full px-2 py-1 text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200"
                        >
                          Table {card.TableNo} bill
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
