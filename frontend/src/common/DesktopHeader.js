import dummyUser from "static/img/dummyUser.jfif";
import { BellDot } from "lucide-react";

const DesktopHeader = () => {
  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <BellDot className="me-10" />
        <div className="me-6 text-right">
          <div className="text-xs text-gray-500">Logged in as</div>
          <div className="text-sm font-semibold">Shivam Tiwari</div>
        </div>
        <img
          src={dummyUser}
          className="w-12 h-12 border-4 shadow-lg rounded-full"
        />
      </div>
    </>
  );
};

export default DesktopHeader;
