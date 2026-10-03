import { Search } from "lucide-react";

const PageSearch = ({ onChange }) => {
  return (
    <>
      <div className="relative">
        <input
          type="search"
          placeholder="Search..."
          onChange={(e) => onChange(e.target.value.trim())}
          className="border border-gray-300 shadow-lg w-60 ps-8 px-2 py-1.5 rounded-full"
        />
        <Search
          size={18}
          className="absolute top-2/4 text-gray-400 left-2 -translate-y-2/4"
        />
      </div>
    </>
  );
};

export default PageSearch;
