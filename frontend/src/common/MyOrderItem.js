import { Star } from "lucide-react";
import { MENU_IMAGE_PATH, rupee } from "static/js/myjs";
import dummyfood from "static/img/food_dummy.png";
import { useMutation } from "@tanstack/react-query";
import { submitReview } from "apis/menu";
import { toast } from "react-toastify";
import { useState, useRef } from "react";
import Confirmation from "./Confirmation";
import { updateOrderStatus } from "apis/orders";
import { MainContext } from "providers/MainProvider";
import { useContext } from "react";

const MyOrderItem = ({ order }) => {
  const { setUserOrders, userOrders } = useContext(MainContext);
  const [ratingBox, setRatingBox] = useState("");
  const [stars, setStars] = useState(0);
  const ratingRef = useRef();
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const updateMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: (d, v) => {
      if (d.status == 1) {
        toast.success("Order Cancelled");
        userOrders.map((ord) => {
          if (ord.id == order.id) {
            ord.Status = "C";
          }
        });
        setUserOrders([...userOrders]);
      } else if (d.status == 0) {
        toast.success("Order not found");
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("An error occured");
    },
  });

  const reviewMutation = useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      toast.success("Review submitted");
      setRatingBox("");
      setStars(0);
    },
    onError: () => {
      toast.success("An error occured");
    },
  });

  function showRatingBox(code) {
    setStars(0);
    setRatingBox(code);
  }

  function submitRemark() {
    reviewMutation.mutate({
      ordercode: ratingBox,
      remark: ratingRef.current.value,
      star: stars,
    });
  }

  let totalprice = 0;

  order.Items.forEach((itm) => {
    totalprice += itm.orderitem.Price;
    if ("addons" in itm) {
      itm.addons.forEach((ad) => {
        totalprice += ad.Price;
      });
    }
  });

  function cancelOrder() {
    updateMutation.mutate({ code: order.Code, status: "C" });
    setCancelConfirm(false);
  }

  return (
    <>
      {cancelConfirm && (
        <Confirmation
          title={`Deleting Order #${order.ShortCode}`}
          message={`Are you sure you want to delete order #${order.ShortCode}`}
          cancelBtn="No"
          confirmBtn="Yes, Cancel"
          onCancel={() => setCancelConfirm(false)}
          onConfirm={() => cancelOrder()}
          className="w-[90vw]"
        />
      )}
      <div
        className={`mb-4 border ${
          order.Status == "A"
            ? "border-blue-500"
            : order.Status == "R"
            ? "border-red-500"
            : order.Status == "S"
            ? "border-green-500"
            : order.Status == "P"
            ? "border-orange-500"
            : order.Status == "C"
            ? "border-rose-500"
            : ""
        } rounded-2xl py-2 ps-2 pe-4 relative overflow-hidden`}
      >
        <div
          className={`absolute right-0 top-0 h-full ${
            order.Status == "A"
              ? "bg-blue-500"
              : order.Status == "R"
              ? "bg-red-500"
              : order.Status == "S"
              ? "bg-green-500"
              : order.Status == "P"
              ? "bg-orange-500"
              : order.Status == "C"
              ? "bg-rose-500"
              : ""
          } w-1.5`}
        ></div>
        <div className="flex gap-4 items-baseline border-b">
          <div className="font-bold flex-1">#{order.ShortCode}</div>
          <div className="border-r pe-2 text-sm">
            Table No: <span className="font-bold text-xl">{order.TableNo}</span>
          </div>
          {order.Status == "C" && (
            <div className="text-sm text-rose-500 font-semibold">Cancelled</div>
          )}
          {order.Status == "P" && (
            <div className="text-sm text-orange-500 font-semibold">Waiting</div>
          )}
          {order.Status == "A" && (
            <div className="text-sm text-blue-500 font-semibold">Preparing</div>
          )}
          {order.Status == "R" && (
            <div className="text-sm text-red-500 font-semibold">Rejected</div>
          )}
          {order.Status == "S" && (
            <div className="text-sm text-green-500 font-semibold">
              Completed
            </div>
          )}
        </div>
        <div>
          {order.Items?.map((item, ind) => {
            let itemtotal = item.orderitem.Price;
            if ("addons" in item) {
              item.addons.forEach((ad) => {
                itemtotal += ad.Price;
              });
            }
            return (
              <div
                className="grid items-center border-b grid-cols-12 gap-2"
                key={"item_" + ind}
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
                  <div className="text-sm font-semibold">{item.data.Name}</div>
                  <div className="text-xs text-gray-500 flex flex-col mb-1">
                    {item.addons.map((adon) => (
                      <div key={"adon_" + adon.Name}>+ {adon.Name}</div>
                    ))}
                  </div>
                  <div className="text-xs flex">
                    <div className="flex-1 font-bold">
                      {rupee} {itemtotal}
                    </div>
                    <div className="font-semibold">
                      Qty. {item.orderitem.Quantity}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

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
                Total{" " + rupee} {totalprice}
              </div>
            </div>
            <div className="flex-1 text-end">
              <div className="text-xs">Order Time</div>
              <div className="text-sm font-bold">{order.OrderTime}</div>
            </div>
          </div>
          {order.Reviews.length > 0 &&
            order.Reviews.map((review, inde) => (
              <div
                key={"rev_" + "_" + inde}
                className="mt-1 pt-2 text-xs border-t"
              >
                <div className="flex gap-2 mb-1">
                  {[...Array(5).keys()].map((s, si) => (
                    <Star
                      key={"st_" + "_" + inde + "_" + si}
                      size={14}
                      className={`${si < review.Star ? "text-yellow-400" : ""}`}
                    />
                  ))}
                </div>
                <div className="text-xs">{review.Remark}</div>
              </div>
            ))}
          {order.Status == "S" && order.Reviews.length == 0 && (
            <div>
              {ratingBox != order.Code && (
                <div className="flex mt-1 pt-2 text-xs border-t">
                  <div>How was your experience?</div>
                  <div
                    onClick={() => showRatingBox(order.Code)}
                    className="justify-end flex flex-1 font-bold text-blue-500"
                  >
                    Give Rating
                  </div>
                </div>
              )}
              {ratingBox == order.Code && (
                <div className="mt-1 pt-2 text-xs border-t">
                  <div className="mb-2 flex gap-2">
                    <div className="flex-1 flex gap-2">
                      {[...Array(5).keys()].map((_, i) => (
                        <Star
                          className={`${i < stars ? "text-yellow-400" : ""}`}
                          size={16}
                          onClick={() => setStars(i + 1)}
                        />
                      ))}
                    </div>
                    <div
                      className="font-bold text-red-500"
                      onClick={() => setRatingBox("")}
                    >
                      Cancel
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <textarea
                      className="flex-1"
                      rows={1}
                      ref={ratingRef}
                      placeholder="Write Review..."
                    ></textarea>
                    <button
                      onClick={() => submitRemark()}
                      className="btn px-2 bg-green-500 text-white"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Order Cancel Button */}
        {order.Status == "P" && (
          <div className="border-t pt-2 mt-2 flex justify-end">
            <div
              onClick={() => setCancelConfirm(true)}
              className="btn bg-red-500 rounded-md px-2 py-1 text-white"
            >
              Cancel Order
            </div>
          </div>
        )}
        {/* Order Cancel Button */}
      </div>
    </>
  );
};

export default MyOrderItem;
