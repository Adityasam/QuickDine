import Menu from "pages/mobile/Menu";
import { OrderProvider } from "providers/OrderProvider";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Success from "pages/mobile/Success";
import Desktop from "pages/desktop/Desktop";
import { ToastContainer } from "react-toastify";
import MyOrders from "pages/mobile/MyOrders";
import { MainProvider } from "providers/MainProvider";
import { DesktopMainProvider } from "providers/DesktopMainProvider";
import Login from "pages/desktop/Login";

const Main = () => {
  return (
    <>
      <div className="w-full h-[100vh] flex flex-col">
        <Router>
          <Routes>
            {/* Mobile routes with MainProvider */}
            <Route
              path="/"
              element={
                <MainProvider>
                  <OrderProvider>
                    <Menu />
                  </OrderProvider>
                </MainProvider>
              }
            />
            <Route
              path="/myorders"
              element={
                <MainProvider>
                  <MyOrders />
                </MainProvider>
              }
            />
            <Route
              path="/success"
              element={
                <MainProvider>
                  <Success />
                </MainProvider>
              }
            />

            {/* Desktop routes with shared DesktopMainProvider */}
            <Route
              element={
                <DesktopMainProvider>
                  <Outlet />
                </DesktopMainProvider>
              }
            >
              <Route path="/login" element={<Login />} />
              <Route path="/desktop" element={<Desktop />} />
              <Route path="/desktop/:page" element={<Desktop />} />
            </Route>
          </Routes>
        </Router>
      </div>
      <ToastContainer autoClose={2500} />
    </>
  );
};

export default Main;
