import { MenuProvider } from "providers/MenuProvider";
import Menu from "./Menu";

const MenuWrapper = () => {
  return (
    <MenuProvider>
      <Menu />
    </MenuProvider>
  );
};

export default MenuWrapper;
