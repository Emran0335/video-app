import React from "react";
import { Menu, Plus, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import { useGetCurrentLoggedInUserQuery } from "@/state/api";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const dispatch = useAppDispatch();
  const { data: user } = useGetCurrentLoggedInUserQuery();

  return (
    <div className="flex w-full h-[80px] items-center justify-between bg-white text-gray-900 px-8">
      <div
        className={`h-full flex items-center ${
          isSidebarCollapsed && "w-[30%]"
        }`}
      >
        {isSidebarCollapsed ? (
          <button
            onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
            className="w-8"
          >
            <Menu className="text-gray-800" />
          </button>
        ) : null}
      </div>
      <div className="flex items-center gap-12 justify-between w-[70%]">
        <div className="relative mr-16 flex w-[600px] h-min border-2 border-gray-300 rounded-full overflow-hidden items-center">
          <Search className="absolute left-2 top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer text-gray-900" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full rounded-tl-full rounded-bl-full border-none bg-gray-100 py-2 pl-8 placeholder-gray-800 focus:border-transparent focus:outline-none shadow-lg"
          />
          <button className="border-l-2 px-1 py-2 border-gray-300 bg-gray-100 hover:bg-gray-300">
            Search
          </button>
        </div>
        <div className="flex items-center gap-16">
          <Link
            href="/addVideo"
            className="flex items-center gap-1 w-24 py-5 rounded-2xl h-6 cursor-pointer bg-gray-100 hover:bg-gray-200 hover:text-gray-700"
          >
            <Plus className="w-6 h-6 ml-1 font-bold text-lg" />
            <span className="font-medium mr-1">Create</span>
          </Link>
          {user && (
            <div className="flex w-[200px] items-center justify-between">
              <h1 className="font-medium hidden md:block">{user.fullName}</h1>
              <div className="w-[40px] h-[40px] rounded-full border-2 border-gray-200 overflow-hidden">
                <Link href="/admin/dashboard">
                  <Image
                    src={user.avatar as string}
                    alt={user.username}
                    width={40}
                    height={40}
                    className="object-cover"
                    style={{ width: "auto", height: "auto" }}
                  />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
