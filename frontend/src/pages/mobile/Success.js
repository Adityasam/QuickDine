import React, { useContext } from "react";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "static/img/logo.png";

const Success = () => {
  React.useEffect(() => {
    setTimeout(() => {
      window.open("/", "_self");
    }, 5000);
  }, []);

  return (
    <>
      <div className="mainBg"></div>
      <div className="text-center items-center flex flex-col h-[100vh]">
        <img src={logo} className="w-[50vw]" />
        <Check
          className="text-white border-4 p-2 rounded-full border-white"
          size={70}
        />
        <div className="bg-white py-2 px-4 mt-8 rounded-full shadow-md">
          Awesome!
        </div>
        <div className="mt-8 font-semibold text-white text-lg">
          <div className="mb-1">Congratulations</div>
          <div>Your order has been placed!</div>
        </div>
        <div className="flex flex-col items-center justify-center fixed bottom-0 left-0 w-full h-[30vh] bg-white">
          <div>Your order will be ready in 20 minutes</div>
          <div onClick={() => window.open("/", "_self")}>
            <div className="bg-background-orange shadow-md text-white font-semibold rounded-full px-4 py-2 mt-4">
              More Hungry, Let's do again
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Success;
