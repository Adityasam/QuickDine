import { Loader } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[#0000008d] z-50 flex items-center justify-center">
      <Loader className="animate-spin" size={50} />
    </div>
  );
};

export default PageLoader;
