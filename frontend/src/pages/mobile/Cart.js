import { rupee } from "../../static/js/myjs";
import { useMutation } from "@tanstack/react-query";
import Counter from "../../common/Counter";
import { X, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useContext } from "react";
import { OrderContext } from "providers/OrderProvider";
import { MENU_IMAGE_PATH, getTotalAmount } from "../../static/js/myjs";
import dummyfood from "static/img/food_dummy.png";
import { saveOrder } from "apis/menu";
import { toast } from "react-toastify";

const Cart = ({ open, onClose, id }) => {
  const navigate = useNavigate();
  const { orderForm, setOrderForm } = useContext(OrderContext);

  const [instructionOpen, setInstructionOpen] = useState(false);
  const instructionRef = useRef(null);

  const saveMutation = useMutation({
    mutationFn: saveOrder,
    onSuccess: (resp, data) => {
      if (resp.status == 1) {
        navigate("/success");
      } else {
        toast.error(resp.message);
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("An error occured");
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

  function placeOrder() {
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
      className={`${
        open ? "bg-[#00000050] pointer-events-auto" : "pointer-events-none"
      } fixed overflow-y-auto top-0 left-0 w-full h-full transition-all duration-500`}
    >
      <div
        className={`${
          open ? "bottom-0" : "-bottom-full"
        } fixed left-0 w-full h-[50vh] bg-white transition-all duration-500`}
      ></div>
      <div
        className={`${
          open ? "bottom-0" : "-bottom-full"
        } absolute transition-all duration-500 rounded-t-3xl left-0 w-full px-4 bg-white h-[70vh] z-10`}
      >
        <X
          className="absolute -top-8 right-2 bg-red-500 rounded-full text-white p-1"
          size={22}
          onClick={() => onClose()}
        />
        <div className="pt-4 px-2">
          <div className="font-bold inline-block border-b-2 pb-1 pe-2">
            Your Order
          </div>

          <div className="border-b">
            {Object.entries(orderForm.items).map(([key, item]) => (
              <div
                key={"item_" + key}
                className="grid pb-2 mb-2 items-center grid-cols-8"
              >
                <div className="col-span-2 p-2">
                  <img
                    src={
                      item?.info?.image
                        ? process.env.REACT_APP_PUBLIC_URL +
                          MENU_IMAGE_PATH +
                          "/" +
                          key +
                          "/" +
                          item?.info?.image
                        : dummyfood
                    }
                  />
                </div>
                <div className="col-span-4 text-sm ps-1">
                  <div className="font-bold pb-1">{item?.info?.name || ""}</div>
                  <div>
                    {rupee} {item?.info?.price || 0}
                  </div>
                </div>
                <div className="col-span-2">
                  <Counter
                    minValue={0}
                    onChange={(val) => changeItemQuantity(val, key)}
                  />
                </div>
                {"options" in item && (
                  <div className="col-span-8 text-xs text-gray-500">
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
                <div
                  onClick={() => setInstructionOpen(false)}
                  className="btn bg-red-500 text-white p-2 rounded-md me-2"
                >
                  Cancel
                </div>
                <div
                  onClick={() => addInstruction()}
                  className="btn bg-green-500 text-white p-2 rounded-md"
                >
                  Add
                </div>
              </div>
            </div>
          </div>
          <div className="flex mt-2 text-sm">
            <div className="flex-1">
              <div className="font-bold">Grand Total</div>
              <div className="text-gray-500 text-[10px]">Inclusive of GST</div>
            </div>
            <div className="text-xl font-bold">
              {rupee} {totalPrice}
            </div>
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
            {Object.keys(orderForm?.items).length} Items
          </div>
          <div className="text-sm">
            {rupee} <span className="font-bold">{totalPrice}</span>
            <span className="ps-2 text-[10px] text-gray-500">GST Included</span>
          </div>
        </div>
        <div className="flex-1 text-end">
          <button
            className="ms-10 btn bg-background-orange"
            onClick={() => placeOrder()}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
