import MobileMenuWrapper from "pages/mobile/MobileMenuWrapper";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Success from "pages/mobile/Success";
import Desktop from "pages/desktop/Desktop";
import { ToastContainer } from "react-toastify";
import MyOrders from "pages/mobile/MyOrders";
import { MainProvider } from "providers/MainProvider";

const Main = () => {
  return (
    <>
      <MainProvider>
        <div className="w-full h-[100vh] flex flex-col">
          <Router>
            <Routes>
              <Route path="/" element={<MobileMenuWrapper />} />
              <Route path="/myorders" element={<MyOrders />} />
              <Route path="/success" element={<Success />} />
              <Route path="/desktop" element={<Desktop />} />
              <Route path="/desktop/:page" element={<Desktop />} />
            </Routes>
          </Router>
        </div>
      </MainProvider>
      <ToastContainer />
    </>
  );
};

export default Main;
