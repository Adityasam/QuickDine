import { OrderProvider } from "providers/OrderProvider";
import Menu from "./Menu";

const MobileMenuWrapper = () => {
  return (
    <>
      <OrderProvider>
        <Menu />
      </OrderProvider>
    </>
  );
};

export default MobileMenuWrapper;
