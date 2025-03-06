import { Star } from "lucide-react";
import { MENU_IMAGE_PATH, rupee } from "static/js/myjs";
import dummyfood from "static/img/food_dummy.png";
import { useMutation } from "@tanstack/react-query";
import { submitReview } from "apis/menu";
import { toast } from "react-toastify";
import { useState, useRef } from "react";

const MyOrderItem = ({ order }) => {
  const [ratingBox, setRatingBox] = useState("");
  const [stars, setStars] = useState(0);
  const ratingRef = useRef();

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

  return (
    <>
      <div
        className={`mb-4 border ${
          order.Status == "A"
            ? "border-blue-500"
            : order.Status == "R"
            ? "border-red-500"
            : order.Status == "S"
            ? "border-green-500"
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
              : ""
          } w-1.5`}
        ></div>
        <div className="flex gap-4 items-baseline border-b">
          <div className="font-bold flex-1">#{order.ShortCode}</div>
          <div className="border-r pe-2 text-sm">
            Table No: <span className="font-bold text-xl">{order.TableNo}</span>
          </div>
          {order.Status == "A" && (
            <div className="text-sm text-blue-500 font-semibold">Preparing</div>
          )}
          {order.Status == "R" && (
            <div className="text-sm text-red-500 font-semibold">Cancelled</div>
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
                    sum + pair.orderitem.Price * pair.orderitem.Quantity,
                  0
                )}
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
      </div>
    </>
  );
};

export default MyOrderItem;
