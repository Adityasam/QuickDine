import { useMutation, useQueryClient } from "@tanstack/react-query";
import Counter from "../../common/Counter";
import { X, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useContext } from "react";
import { OrderContext } from "providers/OrderProvider";
import { money, imageUrl, getTotalAmount } from "static/js/myjs";
import dummyfood from "static/img/food_dummy.png";
import { saveOrder } from "apis/menu";
import { toast } from "react-toastify";

const Cart = ({ open, onClose, id }) => {
  const navigate = useNavigate();
  const { orderForm, setOrderForm } = useContext(OrderContext);
  const queryClient = useQueryClient();

  const [instructionOpen, setInstructionOpen] = useState(false);
  const instructionRef = useRef(null);

  const saveMutation = useMutation({
    mutationFn: saveOrder,
    onSuccess: (resp, data) => {
      if (resp.status == 1) {
        // stale "my orders" cache would briefly show the list without this order
        queryClient.removeQueries({ queryKey: ["getMyOrders"] });
        navigate("/success");
      } else {
        toast.error(resp.message || "Could not place order");
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("Could not place order. Please try again.");
    },
  });

  function addInstruction() {
    if (!instructionRef.current) return;
    if (instructionRef.current.value.trim() == "") return;
    orderForm.note = instructionRef.current.value.trim();
    setOrderForm({ ...orderForm });
    setInstructionOpen(false);
    instructionRef.current.value = "";
  }

  const totalPrice = getTotalAmount(orderForm);

  function changeItemQuantity(val, code) {
    if (val <= 0) {
      delete orderForm.items[code];
    }
    if (code in orderForm.items) {
      orderForm.items[code].info.quantity = val;
    }
    setOrderForm({ ...orderForm });
  }

  function itemTotal(item) {
    let price = item.info.price;
    Object.values(item.options || {}).forEach((group) =>
      Object.values(group).forEach((o) => (price += o.price))
    );
    return price * item.info.quantity;
  }

  const totalQty = Object.values(orderForm.items).reduce((s, i) => s + i.info.quantity, 0);

  function placeOrder() {
    if (saveMutation.isPending) return;
    const fd = new FormData();
    fd.append("data", JSON.stringify(orderForm));
    const tableno = sessionStorage.getItem("TABLENO");
    fd.append("tableno", tableno);

    const userid = localStorage.getItem("USERID");
    fd.append("userid", userid);
    saveMutation.mutate(fd);
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={`${
        open ? "bg-[#00000050] pointer-events-auto" : "pointer-events-none"
      } fixed overflow-y-auto top-0 left-0 w-full h-full transition-all duration-500 z-20`}
    >
      <div
        className={`${
          open ? "bottom-0" : "-bottom-full"
        } fixed transition-all duration-500 rounded-t-3xl left-0 w-full px-4 bg-white max-h-[80vh] overflow-y-auto z-10`}
      >

        <div className="pt-4 px-2">
          <div className="flex items-center">
            <div className="font-bold flex-1">Your Order</div>
            <button aria-label="Close cart" onClick={() => onClose()} className="p-1 text-gray-500">
              <X size={20} />
            </button>
          </div>

          <div className="border-b">
            {Object.entries(orderForm.items).map(([key, item]) => (
              <div
                key={"item_" + key}
                className="grid pb-2 mb-2 items-center grid-cols-8"
              >
                <div className="col-span-2 p-2">
                  <img
                    alt={item?.info?.name || ""}
                    className="rounded-lg aspect-square object-cover"
                    src={item?.info?.image ? imageUrl(key, item.info.image) : dummyfood}
                  />
                </div>
                <div className="col-span-4 text-sm ps-1">
                  <div className="font-bold pb-1">{item?.info?.name || ""}</div>
                  <div>{money(itemTotal(item))}</div>
                </div>
                <div className="col-span-2">
                  <Counter
                    value={item.info.quantity}
                    onChange={(val) => changeItemQuantity(val, key)}
                  />
                </div>
                {"options" in item && (
                  <div className="col-span-8 text-xs text-gray-500 ps-2 -mt-2">
                    {Object.entries(item.options).map(([k, adon]) =>
                      Object.entries(adon).map(([kk, i]) => (
                        <div key={"adon_" + key + "_" + k + "_" + kk}>
                          + {i.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-blue-500 border-b py-2 text-xs items-center">
            <div
              onClick={() => setInstructionOpen(true)}
              className={`${
                instructionOpen || orderForm?.note != "" ? "hidden" : ""
              }`}
            >
              <div className="w-5 inline-block">
                <Pencil size={14} />
              </div>
              <span className="ps-4">Add cooking instructions</span>
            </div>
            {orderForm?.note != "" && (
              <div>
                <div className="font-semibold mb-1">Cooking instructions</div>
                <div className="flex">
                  <div className="flex-1 text-black">{orderForm?.note}</div>
                  <span
                    className="text-red-500 font-semibold"
                    onClick={() => {
                      setOrderForm({ ...orderForm, note: "" });
                    }}
                  >
                    Remove
                  </span>
                </div>
              </div>
            )}
            <div className={`${instructionOpen ? "" : "hidden"}`}>
              <textarea
                ref={instructionRef}
                className="border text-black p-2 rounded-md block w-full"
                rows={3}
                placeholder="Add cooking instructions ..."
              ></textarea>
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => setInstructionOpen(false)}
                  className="btn border text-gray-700 p-2 rounded-md me-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addInstruction()}
                  className="btn bg-green-500 text-white p-2 rounded-md"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
          <div className="flex mt-2 text-sm">
            <div className="flex-1">
              <div className="font-bold">Grand Total</div>
              <div className="text-gray-500 text-[10px]">Inclusive of GST</div>
            </div>
            <div className="text-xl font-bold">{money(totalPrice)}</div>
          </div>
        </div>

        {/* Filler */}
        <div className="h-14"></div>
      </div>

      {/* Total Footer */}
      <div
        className={`${
          open ? "bottom-0" : "-bottom-full"
        } z-20 flex transition-all duration-500 shadow-up fixed left-0 w-full bg-white px-4 py-2`}
      >
        <div>
          <div className="text-xs font-semibold">
            {totalQty} {totalQty === 1 ? "item" : "items"}
          </div>
          <div className="text-sm">
            <span className="font-bold">{money(totalPrice)}</span>
            <span className="ps-2 text-[10px] text-gray-500">GST Included</span>
          </div>
        </div>
        <div className="flex-1 text-end">
          <button
            className="ms-6 btn bg-background-orange font-bold px-5 py-2 disabled:opacity-60"
            disabled={saveMutation.isPending}
            onClick={() => placeOrder()}
          >
            {saveMutation.isPending ? "Placing order..." : "Place order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
