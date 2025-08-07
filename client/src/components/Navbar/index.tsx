import React from "react";
import { Menu, Plus, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import { useGetCurrentLoggedInUserQuery } from "@/state/api";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const { isSidebarCollapsed } = useAppSelector((state) => state.global);
  const dispatch = useAppDispatch();
  const { data: user } = useGetCurrentLoggedInUserQuery();

  return (
    <div className="flex w-full h-[80px] items-center justify-between bg-white px-2 py-3 text-gray-900 md:px-8">
      <div
        className={`w-full flex items-center justify-between ${
          isSidebarCollapsed ? "" : "flex items-center justify-between"
        }`}
      >
        {isSidebarCollapsed && (
          <button
            onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
            className="w-8"
          >
            <Menu className="text-gray-800" />
          </button>
        )}
        <div
          className={`relative h-min w-full hidden md:w-[600px] md:block ${
            isSidebarCollapsed ? "" : "ml-28"
          }`}
        >
          <Search className="absolute left-2 top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer text-gray-900" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full rounded border-none bg-gray-100 py-2 pl-8 placeholder-gray-800 focus:border-transparent focus:outline-none shadow-lg"
          />
        </div>
        <Link
          href=""
          className="flex items-center gap-2 w-30 py-5 px-3 rounded-2xl h-6 cursor-pointer bg-gray-100 hover:bg-gray-200 hover:text-gray-700"
        >
          <Plus className="w-6 h-6" />
          <span className="font-medium">Create</span>
        </Link>
      </div>
      <div className="h-full w-[400px] py-2 rounded-md flex items-center justify-end">
        {user && (
          <div className="flex items-center gap-4">
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
  );
};

export default Navbar;
