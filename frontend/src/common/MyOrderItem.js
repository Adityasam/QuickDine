import { Star } from "lucide-react";
import { imageUrl, money, orderTotal, ORDER_STATUS } from "static/js/myjs";
import dummyfood from "static/img/food_dummy.png";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitReview } from "apis/menu";
import { toast } from "react-toastify";
import { useState, useRef } from "react";

const MyOrderItem = ({ order }) => {
  const [ratingOpen, setRatingOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const ratingRef = useRef();
  const queryClient = useQueryClient();
  const status = ORDER_STATUS[order.Status] || ORDER_STATUS.P;

  const reviewMutation = useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      toast.success("Thanks for your feedback!");
      setRatingOpen(false);
      setStars(0);
      queryClient.invalidateQueries({ queryKey: ["getMyOrders"] });
    },
    onError: () => {
      toast.error("Could not submit review");
    },
  });

  function submitRemark() {
    if (stars === 0) {
      toast.error("Please pick a star rating");
      return;
    }
    reviewMutation.mutate({
      ordercode: order.Code,
      remark: ratingRef.current.value,
      star: stars,
    });
  }

  return (
    <div className={`mb-4 border bg-white ${status.border} rounded-2xl py-2 ps-3 pe-4 relative overflow-hidden`}>
      <div className={`absolute right-0 top-0 h-full ${status.bar} w-1.5`}></div>
      <div className="flex gap-3 items-center border-b pb-2">
        <div className="font-bold flex-1">#{order.ShortCode}</div>
        <div className="text-sm text-gray-600">
          Table <span className="font-bold">{order.TableNo}</span>
        </div>
        <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.badge}`}>{status.label}</div>
      </div>
      <div>
        {order.Items?.map((item, ind) => (
          <div className="grid items-center border-b grid-cols-12 gap-3 py-2" key={"item_" + ind}>
            <div className="col-span-3">
              <img
                alt={item.data.Name || ""}
                loading="lazy"
                className="rounded-lg aspect-square object-cover"
                src={item.images.length > 0 ? imageUrl(item.data.Code, item.images[0]) : dummyfood}
              />
            </div>
            <div className="col-span-9">
              <div className="text-sm font-semibold">{item.data.Name || "Item removed"}</div>
              <div className="text-xs text-gray-500 flex flex-col mb-1">
                {item.addons.map((adon) => (
                  <div key={"adon_" + adon.Code}>+ {adon.Name}</div>
                ))}
              </div>
              <div className="text-xs flex">
                <div className="flex-1 font-bold">{money(item.orderitem.Price)}</div>
                <div className="font-semibold">Qty {item.orderitem.Quantity}</div>
              </div>
            </div>
          </div>
        ))}
        {order.Note && (
          <div className="flex gap-2 text-sm mt-2 border-b pb-2">
            <div className="w-1 rounded-full bg-blue-500"></div>
            <div className="flex-1">
              <div className="font-bold">Note</div>
              <div>{order.Note}</div>
            </div>
          </div>
        )}
        <div className="flex mt-2">
          <div>
            <div className="text-xs">
              {order.Items?.length} {order.Items?.length == 1 ? "Item" : "Items"}
              {order.PaymentStatus == "P" && <span className="ms-2 text-green-600 font-semibold">· Paid</span>}
            </div>
            <div className="text-sm font-bold">Total {money(orderTotal(order))}</div>
          </div>
          <div className="flex-1 text-end">
            <div className="text-xs">Ordered</div>
            <div className="text-sm font-bold">{order.OrderTime}</div>
          </div>
        </div>
        {order.Reviews.map((review, i) => (
          <div key={"rev_" + i} className="mt-2 pt-2 text-xs border-t">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className={s <= review.Star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                />
              ))}
            </div>
            <div className="text-xs">{review.Remark}</div>
          </div>
        ))}
        {order.Status == "S" && order.Reviews.length == 0 && (
          <div className="mt-2 pt-2 text-xs border-t">
            {!ratingOpen ? (
              <div className="flex items-center">
                <div className="flex-1">How was your experience?</div>
                <button onClick={() => setRatingOpen(true)} className="font-bold text-blue-500 py-1">
                  Rate order
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} aria-label={s + " stars"} onClick={() => setStars(s)} className="p-0.5">
                        <Star size={24} className={s <= stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                      </button>
                    ))}
                  </div>
                  <button className="font-bold text-gray-500" onClick={() => setRatingOpen(false)}>
                    Cancel
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <textarea className="flex-1" rows={2} ref={ratingRef} placeholder="Tell us more (optional)"></textarea>
                  <button
                    disabled={reviewMutation.isPending}
                    onClick={submitRemark}
                    className="btn px-3 py-2 bg-green-500 text-white disabled:opacity-60"
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
  );
};

export default MyOrderItem;
