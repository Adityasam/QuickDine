import dummyUser from "static/img/dummyUser.jfif";
import { LogOut, ChevronDown } from "lucide-react";
import { useState, useContext } from "react";
import { DesktopMainContext } from "providers/DesktopMainProvider";

const DesktopHeader = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { userInfo, logout } = useContext(DesktopMainContext);

  return (
    <>
      <div className="flex items-center justify-end mb-4 relative">
        <div className="me-6 text-right">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Logged in as</div>
          <div className="text-sm font-bold text-gray-800">
            {userInfo?.name || ""}
          </div>
        </div>
        <button
          aria-label="Account menu"
          aria-expanded={showDropdown}
          className="relative cursor-pointer group text-left"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="flex items-center gap-2">
            <img
              src={dummyUser}
              className="w-12 h-12 border-4 border-white shadow-md rounded-full group-hover:border-background-orange transition-all duration-300"
              alt="User"
            />
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showDropdown ? "rotate-180" : ""}`} />
          </div>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] py-2 animate-in fade-in zoom-in duration-200">
              <div className="px-4 py-2 border-bottom border-gray-100 mb-1">
                <p className="text-xs font-semibold text-gray-400 uppercase">Account</p>
              </div>
              <div
                role="menuitem"
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-background-orange transition-colors group/item"
              >
                <LogOut className="w-4 h-4 text-gray-400 group-hover/item:text-background-orange" />
                <span className="font-medium">Logout</span>
              </div>
            </div>
          )}
        </button>
      </div>
      {showDropdown && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </>
  );
};

export default DesktopHeader;
