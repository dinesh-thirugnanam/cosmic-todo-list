import { createNode } from "@/lib/actions";
import { LogOutIcon, PlusCircleIcon, PlusIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import React from "react";

const CanvasMenu = ({setAddedNew}) => {
  return (
    <div className="absolute bottom-5 right-5 w-fit h-fit flex flex-col-reverse group z-30">
      <button
        onClick={()=> signOut({redirectTo:"/"})}
        aria-label="Log out"
        className="relative stroke-white flex bg-black w-12 h-12 items-center justify-center rounded-full translate-y-[0%] group-hover:translate-y-[-200%] transition-all duration-200 delay-100 cursor-pointer"
      >
        <LogOutIcon />
        <span className="absolute bg-white text-black px-2 py-1 rounded right-14 top-1/2 transform -translate-y-1/2 hidden group-hover:block whitespace-nowrap w-fit">
          Log Out
        </span>
      </button>
      <button
        onClick={()=>{
            createNode({listName:"New List"});
            setAddedNew(true);
        }}
        aria-label="Add node"
        className="relative stroke-white bg-black w-12 h-12 flex items-center justify-center rounded-full translate-y-[100%] group-hover:translate-y-[0%] transition-all duration-200 delay-100 cursor-pointer"
      >
        <PlusIcon />
        <span className="absolute bg-white text-black px-2 py-1 rounded right-14 top-1/2 transform -translate-y-1/2 hidden group-hover:block whitespace-nowrap w-fit">
          Add Node
        </span>
      </button>
      <button
        aria-label="New canvas"
        className="relative stroke-white bg-black w-12 h-12 flex items-center justify-center rounded-full translate-y-[200%] group-hover:translate-y-[200%] transition-all group-hover:rotate-45 duration-200"
      >
        <PlusCircleIcon />
      </button>
    </div>
  );
};

export default CanvasMenu;