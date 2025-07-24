import React from "react";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";

const Navbar = () => {
  const { isSidebarCollapsed } = useAppSelector((state) => state.global);
  const dispatch = useAppDispatch();

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 text-gray-900 md:px-8">
      <div className="w-full flex items-center gap-8">
        {isSidebarCollapsed ? (
          <button
            onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
          >
            <Menu className="text-gray-800" />
          </button>
        ) : null}
        <div className="relative flex h-min w-full">
          <Search className="absolute left-2 top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer text-gray-900 dark:text-white" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full rounded border-none bg-gray-200 py-2 pl-8 placeholder-gray-900 focus:border-transparent focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-white"
          />
        </div>
      </div>
      <div className="ml-4 bg-blue-400 h-min px-2 py-2 rounded-md">
        <div className="flex items-center justify-around relative">
          <Link href="/signIn" className="w-[100px] text-center">
            Sign in
          </Link>
          <div className="absolute h-10 bg-white text-gray-50 w-1"></div>
          <Link href="/signUp" className="w-[100px] text-center">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
