import { BookOpenTextIcon, PlusCircleIcon, TrashIcon } from "lucide-react";
import React from "react";

const SidePanel = ({ menuActive }) => {
  return (
    <div className="flex flex-col justify-center gap-y-3 items-center h-full">
      <button className="cursor-pointer flex justify-center items-center rounded-2xl border mx-auto py-5 transition-all duration-300 w-full">
        <span
          className={`transition-all duration-300 ${
            menuActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0"
          }`}
        >
          Add a list 
        </span>
        <PlusCircleIcon />
      </button>
      <button className="cursor-pointer flex justify-center items-center rounded-2xl border mx-auto py-5 transition-all duration-300 w-full">
        <span
          className={`transition-all duration-300 ${
            menuActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0"
          }`}
        >
          Delete a list 
        </span>
        <TrashIcon />
      </button>
      <button className="cursor-pointer flex justify-center items-center rounded-2xl border mx-auto py-5 transition-all duration-300 w-full">
        <span
          className={`transition-all duration-300 ${
            menuActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0"
          }`}
        >
          Open a list 
        </span>
        <BookOpenTextIcon />
      </button>
    </div>
  );
};

export default SidePanel;