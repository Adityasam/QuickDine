import Dialog from "./Dialog";
import { useQuery } from "@tanstack/react-query";
import { getSingleOrder, confirmOrderPayment } from "apis/orders";
import { rupee } from "static/js/myjs";
import { useMutation } from "@tanstack/react-query";
import OrderCardItem from "./OrderCardItem";
import { useState } from "react";
import { toast } from "react-toastify";

const ReceivePayment = ({ orderCode, onCancel, onConfirm }) => {
  const [discount, setDiscount] = useState(0);

  const { data: orderData } = useQuery({
    queryKey: ["getSingleOrder", orderCode],
    queryFn: getSingleOrder,
  });

  const updateMutation = useMutation({
    mutationFn: confirmOrderPayment,
    onSuccess: (d) => {
      if (d.status == 1) {
        toast.success("Payment Received");
        onConfirm();
      } else {
        toast.success("An error occured");
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("An error occured");
    },
  });

  function updateStatus() {
    updateMutation.mutate({ code: orderCode, discount: discount });
  }

  const netAmount =
    (orderData?.detail.Items?.reduce(
      (sum, pair) => sum + pair.orderitem.Price * pair.orderitem.Quantity,
      0
    ) || 0) - discount;

  return (
    <>
      <Dialog
        open={true}
        onClose={onCancel}
        className="w-20"
        title={`Receive payment for #${orderData?.detail?.ShortCode}`}
      >
        <div className="max-h-[80vh] overflow-h-auto">
          <div>
            {orderData?.detail.Items.map((item, ind) => (
              <OrderCardItem key={"item_" + ind} item={item} />
            ))}
          </div>
          <div className="grid grid-cols-8 gap-4 mt-2 pt-2 font-semibold items-center">
            <div className="col-span-6 justify-end flex">Total Amount</div>
            <div className="col-span-2 justify-end flex">
              {rupee}
              {orderData?.detail.Items?.reduce(
                (sum, pair) =>
                  sum + pair.orderitem.Price * pair.orderitem.Quantity,
                0
              )}
            </div>
          </div>
          <div className="grid grid-cols-8 gap-4 mt-2 pt-2 font-semibold items-center">
            <div className="col-span-6 justify-end flex">Discount</div>
            <div className="col-span-2 justify-end flex">
              <input
                type="number"
                className="w-full text-end text-sm"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-8 gap-4 mt-4 pt-2 font-semibold items-center border-t-2">
            <div className="col-span-6 justify-end flex">Net Amount</div>
            <div className="col-span-2 justify-end flex">
              {rupee}
              {netAmount}
            </div>
          </div>
          <div className="flex border-t mt-2 pt-2">
            <button
              onClick={() => updateStatus()}
              className="btn px-2 py-1 border rounded bg-green-500 text-white"
            >
              Confirm Payment
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ReceivePayment;
