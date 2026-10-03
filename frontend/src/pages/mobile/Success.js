import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "static/img/logo.png";

const Success = () => {
  return (
    <>
      <div className="mainBg"></div>
      <div className="text-center items-center flex flex-col h-[100vh]">
        <img src={logo} alt="QuickDine" className="w-[50vw] max-w-xs" />
        <Check
          className="text-white border-4 p-2 rounded-full border-white animate-fadeIn"
          size={70}
        />
        <div className="mt-8 font-semibold text-white text-lg">
          <div className="mb-1 text-2xl">Order placed!</div>
          <div>The kitchen has received your order.</div>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 fixed bottom-0 left-0 w-full h-[30vh] bg-white rounded-t-3xl">
          <Link
            to="/myorders"
            className="bg-background-orange shadow-md font-semibold rounded-full px-6 py-2"
          >
            Track my order
          </Link>
          <Link to="/" className="text-gray-600 font-semibold px-6 py-2">
            Order something else
          </Link>
        </div>
      </div>
    </>
  );
};

export default Success;
